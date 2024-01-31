import { Response } from "../../Response";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import { BaseSelector, LLMSingleSelector } from "../../selectors";
import { TreeSummarize } from "../../synthesizers";
import {
  BaseQueryEngine,
  QueryBundle,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types";

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

  const responseStrs = [];
  const sourceNodes = [];

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
export class RouterQueryEngine implements BaseQueryEngine {
  _selector: BaseSelector;
  _queryEngines: BaseQueryEngine[];
  serviceContext: ServiceContext;
  _metadatas: RouterQueryEngineMetadata[];
  _summarizer: TreeSummarize;
  _verbose: boolean;

  constructor(init: {
    selector: BaseSelector;
    queryEngineTools: RouterQueryEngineTool[];
    serviceContext?: ServiceContext;
    summarizer?: TreeSummarize;
    verbose?: boolean;
  }) {
    this.serviceContext = init.serviceContext || serviceContextFromDefaults({});
    this._selector = init.selector;
    this._queryEngines = init.queryEngineTools.map((tool) => tool.queryEngine);
    this._metadatas = init.queryEngineTools.map((tool) => ({
      description: tool.description,
    }));
    this._summarizer =
      init.summarizer || new TreeSummarize(this.serviceContext);
    this._verbose = init.verbose ?? false;
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
      return response;
    }

    return response;
  }

  private async queryRoute(queryBundle: QueryBundle): Promise<Response> {
    const result = await this._selector.select(this._metadatas, queryBundle);

    if (result.selections.length > 1) {
      const responses = [];
      for (let i = 0; i < result.selections.length; i++) {
        const engineInd = result.selections[i];
        const logStr = `Selecting query engine ${engineInd}: ${result.selections[i]}.`;

        if (this._verbose) {
          console.log(logStr + "\n");
        }

        const selectedQueryEngine = this._queryEngines[engineInd.index];
        responses.push(
          await selectedQueryEngine.query({
            query: queryBundle.queryStr,
          }),
        );
      }

      if (responses.length > 1) {
        const finalResponse = await combineResponses(
          this._summarizer,
          responses,
          queryBundle,
          this._verbose,
        );

        return finalResponse;
      } else {
        return responses[0];
      }
    } else {
      let selectedQueryEngine;

      try {
        selectedQueryEngine = this._queryEngines[result.selections[0].index];

        const logStr = `Selecting query engine ${result.selections[0].index}: ${result.selections[0].reason}`;
        console.log(logStr);
        if (this._verbose) {
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
