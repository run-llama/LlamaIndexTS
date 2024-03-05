import type { BaseNode } from "../../Node.js";
import { Response } from "../../Response.js";
import type { ServiceContext } from "../../ServiceContext.js";
import { serviceContextFromDefaults } from "../../ServiceContext.js";
import { PromptMixin } from "../../prompts/index.js";
import type { BaseSelector } from "../../selectors/index.js";
import { LLMSingleSelector } from "../../selectors/index.js";
import { TreeSummarize } from "../../synthesizers/index.js";
import type {
  BaseQueryEngine,
  QueryBundle,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";

type RouterQueryEngineTool = {
  queryEngine: BaseQueryEngine;
  description: string;
};

type RouterQueryEngineMetadata = {
  description: string;
};

async function combineResponses(
  summarizer: TreeSummarize,
  responses: Response[],
  queryBundle: QueryBundle,
  verbose: boolean = false,
): Promise<Response> {
  if (verbose) {
    console.log("Combining responses from multiple query engines.");
  }

  const responseStrs: string[] = [];
  const sourceNodes: BaseNode[] = [];

  for (const response of responses) {
    if (response?.sourceNodes) {
      sourceNodes.push(...response.sourceNodes);
    }

    responseStrs.push(response.response);
  }

  const summary = await summarizer.getResponse({
    query: queryBundle.queryStr,
    textChunks: responseStrs,
  });

  return new Response(summary, sourceNodes);
}

/**
 * A query engine that uses multiple query engines and selects the best one.
 */
export class RouterQueryEngine extends PromptMixin implements BaseQueryEngine {
  serviceContext: ServiceContext;

  private selector: BaseSelector;
  private queryEngines: BaseQueryEngine[];
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

    this.serviceContext = init.serviceContext || serviceContextFromDefaults({});
    this.selector = init.selector;
    this.queryEngines = init.queryEngineTools.map((tool) => tool.queryEngine);
    this.metadatas = init.queryEngineTools.map((tool) => ({
      description: tool.description,
    }));
    this.summarizer = init.summarizer || new TreeSummarize(this.serviceContext);
    this.verbose = init.verbose ?? false;
  }

  _getPromptModules(): Record<string, any> {
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
    const serviceContext =
      init.serviceContext ?? serviceContextFromDefaults({});

    return new RouterQueryEngine({
      selector:
        init.selector ?? new LLMSingleSelector({ llm: serviceContext.llm }),
      queryEngineTools: init.queryEngineTools,
      serviceContext,
      summarizer: init.summarizer,
      verbose: init.verbose,
    });
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;

    const response = await this.queryRoute({ queryStr: query });

    if (stream) {
      throw new Error("Streaming is not supported yet.");
    }

    return response;
  }

  private async queryRoute(queryBundle: QueryBundle): Promise<Response> {
    const result = await this.selector.select(this.metadatas, queryBundle);

    if (result.selections.length > 1) {
      const responses: Response[] = [];
      for (let i = 0; i < result.selections.length; i++) {
        const engineInd = result.selections[i];
        const logStr = `Selecting query engine ${engineInd}: ${result.selections[i]}.`;

        if (this.verbose) {
          console.log(logStr + "\n");
        }

        const selectedQueryEngine = this.queryEngines[engineInd.index];
        responses.push(
          await selectedQueryEngine.query({
            query: queryBundle.queryStr,
          }),
        );
      }

      if (responses.length > 1) {
        const finalResponse = await combineResponses(
          this.summarizer,
          responses,
          queryBundle,
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
        query: queryBundle.queryStr,
      });

      // add selected result
      finalResponse.metadata = finalResponse.metadata || {};
      finalResponse.metadata["selectorResult"] = result;

      return finalResponse;
    }
  }
}
