import { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { getResponseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { type NodeWithScore } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import type { BaseRetriever } from "../../Retriever.js";

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine extends BaseQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: BaseSynthesizer;
  nodePostprocessors: BaseNodePostprocessor[];
  preFilters?: unknown;

  constructor(
    retriever: BaseRetriever,
    responseSynthesizer?: BaseSynthesizer,
    preFilters?: unknown,
    nodePostprocessors?: BaseNodePostprocessor[],
  ) {
    super(async (strOrQueryBundle, stream) => {
      const nodesWithScore = await this.retrieve(
        typeof strOrQueryBundle === "string"
          ? strOrQueryBundle
          : extractText(strOrQueryBundle),
      );
      if (stream) {
        return this.responseSynthesizer.synthesize(
          {
            query:
              typeof strOrQueryBundle === "string"
                ? { query: strOrQueryBundle }
                : strOrQueryBundle,
            nodes: nodesWithScore,
          },
          true,
        );
      }
      return this.responseSynthesizer.synthesize({
        query:
          typeof strOrQueryBundle === "string"
            ? { query: strOrQueryBundle }
            : strOrQueryBundle,
        nodes: nodesWithScore,
      });
    });

    this.retriever = retriever;
    this.responseSynthesizer =
      responseSynthesizer || getResponseSynthesizer("compact");
    this.preFilters = preFilters;
    this.nodePostprocessors = nodePostprocessors || [];
  }

  protected _getPrompts() {
    return {};
  }

  protected _updatePrompts() {}

  _getPromptModules() {
    return {
      responseSynthesizer: this.responseSynthesizer,
    };
  }

  private async applyNodePostprocessors(nodes: NodeWithScore[], query: string) {
    let nodesWithScore = nodes;

    for (const postprocessor of this.nodePostprocessors) {
      nodesWithScore = await postprocessor.postprocessNodes(
        nodesWithScore,
        query,
      );
    }

    return nodesWithScore;
  }

  private async retrieve(query: string) {
    const nodes = await this.retriever.retrieve({
      query,
      preFilters: this.preFilters,
    });

    return await this.applyNodePostprocessors(nodes, query);
  }
}
