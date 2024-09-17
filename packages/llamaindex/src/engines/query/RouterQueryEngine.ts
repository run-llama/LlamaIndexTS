import { PromptMixin } from "@llamaindex/core/prompts";
import type { QueryBundle } from "@llamaindex/core/query-engine";
import {
  BaseSynthesizer,
  getResponseSynthesizer,
} from "@llamaindex/core/response-synthesizers";
import { EngineResponse, type NodeWithScore } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import type { ServiceContext } from "../../ServiceContext.js";
import { llmFromSettingsOrContext } from "../../Settings.js";
import type { BaseSelector } from "../../selectors/index.js";
import { LLMSingleSelector } from "../../selectors/index.js";
import type {
  QueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";

type RouterQueryEngineTool = {
  queryEngine: QueryEngine;
  description: string;
};

type RouterQueryEngineMetadata = {
  description: string;
};

async function combineResponses(
  summarizer: BaseSynthesizer,
  responses: EngineResponse[],
  queryBundle: QueryBundle,
  verbose: boolean = false,
): Promise<EngineResponse> {
  if (verbose) {
    console.log("Combining responses from multiple query engines.");
  }

  const sourceNodes: NodeWithScore[] = [];

  for (const response of responses) {
    if (response?.sourceNodes) {
      sourceNodes.push(...response.sourceNodes);
    }
  }

  return await summarizer.synthesize({
    query: queryBundle,
    nodes: sourceNodes,
  });
}

/**
 * A query engine that uses multiple query engines and selects the best one.
 */
export class RouterQueryEngine extends PromptMixin implements QueryEngine {
  private selector: BaseSelector;
  private queryEngines: QueryEngine[];
  private metadatas: RouterQueryEngineMetadata[];
  private summarizer: BaseSynthesizer;
  private verbose: boolean;

  constructor(init: {
    selector: BaseSelector;
    queryEngineTools: RouterQueryEngineTool[];
    serviceContext?: ServiceContext | undefined;
    summarizer?: BaseSynthesizer | undefined;
    verbose?: boolean | undefined;
  }) {
    super();

    this.selector = init.selector;
    this.queryEngines = init.queryEngineTools.map((tool) => tool.queryEngine);
    this.metadatas = init.queryEngineTools.map((tool) => ({
      description: tool.description,
    }));
    this.summarizer =
      init.summarizer || getResponseSynthesizer("tree_summarize");
    this.verbose = init.verbose ?? false;
  }

  protected _getPrompts() {
    return {};
  }

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
    summarizer?: BaseSynthesizer;
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

    const response = await this.queryRoute(
      typeof query === "string" ? { query } : query,
    );

    if (stream) {
      throw new Error("Streaming is not supported yet.");
    }

    return response;
  }

  private async queryRoute(query: QueryBundle): Promise<EngineResponse> {
    const result = await this.selector.select(this.metadatas, query);

    if (result.selections.length > 1) {
      const responses: EngineResponse[] = [];
      for (let i = 0; i < result.selections.length; i++) {
        const engineInd = result.selections[i]!;
        const logStr = `Selecting query engine ${engineInd.index}: ${result.selections[i]!.index}.`;

        if (this.verbose) {
          console.log(logStr + "\n");
        }

        const selectedQueryEngine = this.queryEngines[engineInd.index]!;
        responses.push(
          await selectedQueryEngine.query({
            query,
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
        return responses[0]!;
      }
    } else {
      let selectedQueryEngine;

      try {
        selectedQueryEngine = this.queryEngines[result.selections[0]!.index];

        const logStr = `Selecting query engine ${result.selections[0]!.index}: ${result.selections[0]!.reason}`;

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
