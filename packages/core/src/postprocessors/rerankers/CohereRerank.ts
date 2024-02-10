import { CohereClient } from "cohere-ai";

import { MetadataMode, NodeWithScore } from "../../Node";
import { BaseNodePostprocessor } from "../types";

type CohereRerankOptions = {
  topN?: number;
  model?: string;
  apiKey: string | null;
};

export class CohereRerank implements BaseNodePostprocessor {
  topN: number = 2;
  model: string = "rerank-english-v2.0";
  apiKey: string | null = null;

  private client: CohereClient | null = null;

  /**
   * Constructor for CohereRerank.
   * @param topN Number of nodes to return.
   */
  constructor({
    topN = 2,
    model = "rerank-english-v2.0",
    apiKey = null,
  }: CohereRerankOptions) {
    if (apiKey === null) {
      throw new Error("CohereRerank requires an API key");
    }

    this.topN = topN;
    this.model = model;
    this.apiKey = apiKey;

    this.client = new CohereClient({
      token: this.apiKey,
    });
  }

  /**
   * Reranks the nodes using the Cohere API.
   * @param nodes Array of nodes with scores.
   * @param query Query string.
   */
  async postprocessNodes(
    nodes: NodeWithScore[],
    query?: string,
  ): Promise<NodeWithScore[]> {
    if (this.client === null) {
      throw new Error("CohereRerank client is null");
    }

    if (nodes.length === 0) {
      return [];
    }

    if (query === undefined) {
      throw new Error("CohereRerank requires a query");
    }

    const results = await this.client.rerank({
      query,
      model: this.model,
      topN: this.topN,
      documents: nodes.map((n) => n.node.getContent(MetadataMode.ALL)),
    });

    const newNodes: NodeWithScore[] = [];

    for (const result of results.results) {
      const node = nodes[result.index];

      newNodes.push({
        node: node.node,
        score: result.relevanceScore,
      });
    }

    return newNodes;
  }
}
