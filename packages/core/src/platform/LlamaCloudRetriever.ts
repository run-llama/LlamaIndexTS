import { NodeWithScore, jsonToNode } from "../Node";
import { BaseRetriever } from "../Retriever";
import { ServiceContext } from "../ServiceContext";
import { Event } from "../callbacks/CallbackManager";
import { PlatformApiClient } from "./client";
import { RetrievalParams, TextNodeWithScore } from "./client/api";

type RetrieverParams = Omit<RetrievalParams, "query" | "searchFilters">;

export class LlamaCloudRetriever implements BaseRetriever {
  client: PlatformApiClient;
  params: RetrieverParams;

  private resultNodesToNodeWithScore(
    nodes: TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: TextNodeWithScore) => {
      return {
        node: jsonToNode(node.node),
        score: node.score,
      };
    });
  }

  constructor(client: PlatformApiClient, params: RetrieverParams) {
    this.client = client;
    this.params = params;
  }

  async retrieve(
    query: string,
    parentEvent?: Event | undefined,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
    // TODO: add event
    const results = await this.client.retrieval.runSearch({
      ...this.params,
      query,
      searchFilters: preFilters as Record<string, unknown[]>,
    });

    return this.resultNodesToNodeWithScore(results.retrievalNodes);
  }

  getServiceContext(): ServiceContext {
    throw new Error("Method not implemented.");
  }
}
