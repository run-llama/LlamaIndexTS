import type { QueryType } from "@llamaindex/core/query-engine";
import { EngineResponse, type NodeWithScore } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import type { ServiceContext } from "../../ServiceContext.js";
import { llmFromSettingsOrContext } from "../../Settings.js";
import type { BaseSelector } from "../../selectors/index.js";
import { LLMSingleSelector } from "../../selectors/index.js";
import { TreeSummarize } from "../../synthesizers/index.js";
import type {
  QueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";
import { PromptMixin, type PromptsRecord } from '@llamaindex/core/prompts';

type RouterQueryEngineTool = {
  queryEngine: QueryEngine;
  description: string;
};

type RouterQueryEngineMetadata = {
  description: string;
};

async function combineResponses (
  summarizer: TreeSummarize,
  responses: EngineResponse[],
  queryType: QueryType,
  verbose: boolean = false
): Promise<EngineResponse> {
  if (verbose) {
    console.log('Combining responses from multiple query engines.');
  }

  const responseStrs: string[] = [];
  const sourceNodes: NodeWithScore[] = [];

  for (const response of responses) {
    if (response?.sourceNodes) {
      sourceNodes.push(...response.sourceNodes);
    }

    responseStrs.push(extractText(response.message.content));
  }

  const summary = await summarizer.getResponse({
    query: extractText(queryType),
    textChunks: responseStrs
  });

  return EngineResponse.fromResponse(summary, false, sourceNodes);
}

/**
 * A query engine that uses multiple query engines and selects the best one.
 */
export class RouterQueryEngine extends PromptMixin implements QueryEngine {
  private selector: BaseSelector;
  private queryEngines: QueryEngine[];
  private metadatas: RouterQueryEngineMetadata[];
  private summarizer: TreeSummarize;
  private verbose: boolean;

  constructor(init: {
    selector: BaseSelector;
    queryEngineTools: RouterQueryEngineTool[];
    serviceContext?: ServiceContext;
    summarizer?: TreeSummarize;
    verbose?: boolean;
  }) {
    super();

    this.selector = init.selector;
    this.queryEngines = init.queryEngineTools.map((tool) => tool.queryEngine);
    this.metadatas = init.queryEngineTools.map((tool) => ({
      description: tool.description,
    }));
    this.summarizer = init.summarizer || new TreeSummarize(init.serviceContext);
    this.verbose = init.verbose ?? false;
  }

  protected _getPrompts() {return  {}}

  protected _updatePrompts() {}

  protected _getPromptModules() {
    return {
      selector: this.selector,
      summarizer: this.summarizer,
    };
  }

  static fromDefaults(init: {
    queryEngineTools: RouterQueryEngineTool[];
    selector?: BaseSelector;
    serviceContext?: ServiceContext;
    summarizer?: TreeSummarize;
    verbose?: boolean;
  }) {
    const serviceContext = init.serviceContext;

    return new RouterQueryEngine({
      selector:
        init.selector ??
        new LLMSingleSelector({
          llm: llmFromSettingsOrContext(serviceContext),
        }),
      queryEngineTools: init.queryEngineTools,
      serviceContext,
      summarizer: init.summarizer,
      verbose: init.verbose,
    });
  }

  query(
    params: QueryEngineParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  query(params: QueryEngineParamsNonStreaming): Promise<EngineResponse>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { query, stream } = params;

    const response = await this.queryRoute(query);

    if (stream) {
      throw new Error("Streaming is not supported yet.");
    }

    return response;
  }

  private async queryRoute(query: QueryType): Promise<EngineResponse> {
    const result = await this.selector.select(this.metadatas, query);

    if (result.selections.length > 1) {
      const responses: EngineResponse[] = [];
      for (let i = 0; i < result.selections.length; i++) {
        const engineInd = result.selections[i];
        const logStr = `Selecting query engine ${engineInd.index}: ${result.selections[i].index}.`;

        if (this.verbose) {
          console.log(logStr + "\n");
        }

        const selectedQueryEngine = this.queryEngines[engineInd.index];
        responses.push(
          await selectedQueryEngine.query({
            query: extractText(query),
          }),
        );
      }

      if (responses.length > 1) {
        const finalResponse = await combineResponses(
          this.summarizer,
          responses,
          query,
          this.verbose,
        );

        return finalResponse;
      } else {
        return responses[0];
      }
    } else {
      let selectedQueryEngine;

      try {
        selectedQueryEngine = this.queryEngines[result.selections[0].index];

        const logStr = `Selecting query engine ${result.selections[0].index}: ${result.selections[0].reason}`;

        if (this.verbose) {
          console.log(logStr + "\n");
        }
      } catch (e) {
        throw new Error("Failed to select query engine");
      }

      if (!selectedQueryEngine) {
        throw new Error("Selected query engine is null");
      }

      const finalResponse = await selectedQueryEngine.query({
        query: extractText(query),
      });

      // add selected result
      finalResponse.metadata = finalResponse.metadata || {};
      finalResponse.metadata["selectorResult"] = result;

      return finalResponse;
    }
  }
}
