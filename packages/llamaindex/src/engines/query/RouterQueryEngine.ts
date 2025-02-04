import {
  BaseQueryEngine,
  type QueryBundle,
  type QueryType,
} from "@llamaindex/core/query-engine";
import {
  BaseSynthesizer,
  getResponseSynthesizer,
} from "@llamaindex/core/response-synthesizers";
import { EngineResponse, type NodeWithScore } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import { llmFromSettings } from "../../Settings.js";
import type { BaseSelector } from "../../selectors/index.js";
import { LLMSingleSelector } from "../../selectors/index.js";

type RouterQueryEngineTool = {
  queryEngine: BaseQueryEngine;
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
export class RouterQueryEngine extends BaseQueryEngine {
  private selector: BaseSelector;
  private queryEngines: BaseQueryEngine[];
  private metadatas: RouterQueryEngineMetadata[];
  private summarizer: BaseSynthesizer;
  private verbose: boolean;

  constructor(init: {
    selector: BaseSelector;
    queryEngineTools: RouterQueryEngineTool[];
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

  override async _query(strOrQueryBundle: QueryType, stream?: boolean) {
    const response = await this.queryRoute(
      typeof strOrQueryBundle === "string"
        ? { query: strOrQueryBundle }
        : strOrQueryBundle,
    );

    if (stream) {
      throw new Error("Streaming is not supported yet.");
    }

    return response;
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
    summarizer?: BaseSynthesizer;
    verbose?: boolean;
  }) {
    return new RouterQueryEngine({
      selector:
        init.selector ??
        new LLMSingleSelector({
          llm: llmFromSettings(),
        }),
      queryEngineTools: init.queryEngineTools,
      summarizer: init.summarizer,
      verbose: init.verbose,
    });
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
          await selectedQueryEngine.query({ query, stream: false }),
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
