import { getEnv } from "@llamaindex/env";
import type { NodeWithScore } from "../../Node.js";
import { MetadataMode } from "../../Node.js";
import type { BaseNodePostprocessor } from "../types.js";

interface JinaAIRerankerResult {
  index: number;
  document?: {
    text?: string;
  };
  relevance_score: number;
}

export class JinaAIReranker implements BaseNodePostprocessor {
  model: string = "jina-reranker-v1-base-en";
  topN?: number;
  apiKey?: string = undefined;

  constructor(init?: Partial<JinaAIReranker>) {
    this.topN = init?.topN ?? 2;
    this.model = init?.model ?? "jina-reranker-v1-base-en";
    this.apiKey = getEnv("JINAAI_API_KEY");

    if (!this.apiKey) {
      throw new Error(
        "Set Jina AI API Key in JINAAI_API_KEY env variable. Get one for free or top up your key at https://jina.ai/reranker",
      );
    }
  }

  async rerank(
    query: string,
    documents: string[],
    topN: number | undefined = this.topN,
  ): Promise<JinaAIRerankerResult[]> {
    const url = "https://api.jina.ai/v1/rerank";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    const data = {
      model: this.model,
      query: query,
      documents: documents,
      top_n: topN,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const jsonData = await response.json();

      return jsonData.results;
    } catch (error) {
      console.error("Error while reranking:", error);
      throw new Error("Failed to rerank documents due to an API error");
    }
  }

  async postprocessNodes(
    nodes: NodeWithScore[],
    query?: string,
  ): Promise<NodeWithScore[]> {
    if (nodes.length === 0) {
      return [];
    }

    if (query === undefined) {
      throw new Error("JinaAIReranker requires a query");
    }

    const documents = nodes.map((n) => n.node.getContent(MetadataMode.ALL));
    const results = await this.rerank(query, documents, this.topN);
    const newNodes: NodeWithScore[] = [];

    for (const result of results) {
      const node = nodes[result.index];
      newNodes.push({
        node: node.node,
        score: result.relevance_score,
      });
    }

    return newNodes;
  }
}
