import type { MessageContent } from "../llms";
import type { BaseNodePostprocessor } from "../postprocessor";
import {
  type BaseSynthesizer,
  getResponseSynthesizer,
} from "../response-synthesizers";
import { BaseRetriever } from "../retriever";
import type { NodeWithScore } from "../schema";
import { extractText } from "../utils";
import { BaseQueryEngine, type QueryType } from "./base";

export class RetrieverQueryEngine extends BaseQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: BaseSynthesizer;
  nodePostprocessors: BaseNodePostprocessor[];

  constructor(
    retriever: BaseRetriever,
    responseSynthesizer?: BaseSynthesizer,
    nodePostprocessors?: BaseNodePostprocessor[],
  ) {
    super();

    this.retriever = retriever;
    this.responseSynthesizer =
      responseSynthesizer || getResponseSynthesizer("compact");
    this.nodePostprocessors = nodePostprocessors || [];
  }

  override async _query(strOrQueryBundle: QueryType, stream?: boolean) {
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
