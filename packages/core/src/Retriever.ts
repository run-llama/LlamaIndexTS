import { VectorStoreIndex } from "./BaseIndex";
import { globalsHelper } from "./GlobalsHelper";
import { NodeWithScore } from "./Node";
import { ServiceContext } from "./ServiceContext";
import { Event } from "./callbacks/CallbackManager";
import { DEFAULT_SIMILARITY_TOP_K } from "./constants";
import {
  VectorStoreQuery,
  VectorStoreQueryMode,
} from "./storage/vectorStore/types";

export interface BaseRetriever {
  aretrieve(query: string, parentEvent?: Event): Promise<NodeWithScore[]>;
  getServiceContext(): ServiceContext;
}

export class VectorIndexRetriever implements BaseRetriever {
  index: VectorStoreIndex;
  similarityTopK = DEFAULT_SIMILARITY_TOP_K;
  private serviceContext: ServiceContext;

  constructor(index: VectorStoreIndex) {
    this.index = index;
    this.serviceContext = this.index.serviceContext;
  }

  async aretrieve(
    query: string,
    parentEvent?: Event
  ): Promise<NodeWithScore[]> {
    const queryEmbedding =
      await this.serviceContext.embedModel.aGetQueryEmbedding(query);

    const q: VectorStoreQuery = {
      queryEmbedding: queryEmbedding,
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK: this.similarityTopK,
    };
    const result = this.index.vectorStore.query(q);

    let nodesWithScores: NodeWithScore[] = [];
    for (let i = 0; i < result.ids.length; i++) {
      const node = this.index.indexStruct.nodesDict[result.ids[i]];
      nodesWithScores.push({
        node: node,
        score: result.similarities[i],
      });
    }

    if (this.serviceContext.callbackManager.onRetrieve) {
      this.serviceContext.callbackManager.onRetrieve({
        query,
        nodes: nodesWithScores,
        event: globalsHelper.createEvent({
          parentEvent,
          type: "retrieve",
        }),
      });
    }

    return nodesWithScores;
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }
}
