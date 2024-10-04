import type { MessageContent } from "@llamaindex/core/llms";
import { BaseQueryEngine, type QueryType } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { getResponseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { BaseRetriever } from "@llamaindex/core/retriever";
import { type NodeWithScore } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine extends BaseQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: BaseSynthesizer;
  nodePostprocessors: BaseNodePostprocessor[];

  constructor(
    retriever: BaseRetriever,
    responseSynthesizer?: BaseSynthesizer,
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

  private async applyNodePostprocessors(
    nodes: NodeWithScore[],
    query: MessageContent,
  ) {
    let nodesWithScore = nodes;

    for (const postprocessor of this.nodePostprocessors) {
      nodesWithScore = await postprocessor.postprocessNodes(
        nodesWithScore,
        query,
      );
    }

    return nodesWithScore;
  }

  override async retrieve(query: QueryType) {
    const nodes = await this.retriever.retrieve(query);

    const messageContent = typeof query === "string" ? query : query.query;
    return await this.applyNodePostprocessors(nodes, messageContent);
  }
}
