import { Event } from "../../callbacks/CallbackManager";
import { DEFAULT_SIMILARITY_TOP_K } from "../../constants";
import { BaseEmbedding } from "../../embeddings";
import { globalsHelper } from "../../GlobalsHelper";
import { Metadata, NodeWithScore } from "../../Node";
import { BaseRetriever } from "../../Retriever";
import { ServiceContext } from "../../ServiceContext";
import {
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
} from "../../storage/vectorStore/types";
import { VectorStoreIndex } from "./VectorStoreIndex";

/**
 * VectorIndexRetriever retrieves nodes from a VectorIndex.
 */

export class VectorIndexRetriever implements BaseRetriever {
  index: VectorStoreIndex;
  similarityTopK;
  private serviceContext: ServiceContext;

  constructor({
    index,
    similarityTopK,
  }: {
    index: VectorStoreIndex;
    similarityTopK?: number;
  }) {
    this.index = index;
    this.serviceContext = this.index.serviceContext;

    this.similarityTopK = similarityTopK ?? DEFAULT_SIMILARITY_TOP_K;
  }

  async retrieve(
    query: string,
    parentEvent?: Event,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
    let nodesWithScores = await this.textRetrieve(query, preFilters);
    nodesWithScores = nodesWithScores.concat(
      await this.textToImageRetrieve(query, preFilters),
    );
    this.sendEvent(query, nodesWithScores, parentEvent);
    return nodesWithScores;
  }

  protected async textRetrieve(
    query: string,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
    const q = await this.buildVectorStoreQuery(this.index.embedModel, query);
    const result = await this.index.vectorStore.query(q, preFilters);
    return this.buildNodeListFromQueryResult(result);
  }

  private async textToImageRetrieve(query: string, preFilters?: unknown) {
    if (!this.index.imageEmbedModel || !this.index.imageVectorStore) {
      // no-op if image embedding and vector store are not set
      return [];
    }
    const q = await this.buildVectorStoreQuery(
      this.index.imageEmbedModel,
      query,
    );
    const result = await this.index.imageVectorStore.query(q, preFilters);
    return this.buildNodeListFromQueryResult(result);
  }

  protected sendEvent(
    query: string,
    nodesWithScores: NodeWithScore<Metadata>[],
    parentEvent: Event | undefined,
  ) {
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
  }

  protected async buildVectorStoreQuery(
    embedModel: BaseEmbedding,
    query: string,
  ): Promise<VectorStoreQuery> {
    const queryEmbedding = await embedModel.getQueryEmbedding(query);

    return {
      queryEmbedding: queryEmbedding,
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK: this.similarityTopK,
    };
  }

  protected buildNodeListFromQueryResult(result: VectorStoreQueryResult) {
    let nodesWithScores: NodeWithScore[] = [];
    for (let i = 0; i < result.ids.length; i++) {
      const nodeFromResult = result.nodes?.[i];
      if (!this.index.indexStruct.nodesDict[result.ids[i]] && nodeFromResult) {
        this.index.indexStruct.nodesDict[result.ids[i]] = nodeFromResult;
      }

      const node = this.index.indexStruct.nodesDict[result.ids[i]];
      nodesWithScores.push({
        node: node,
        score: result.similarities[i],
      });
    }

    return nodesWithScores;
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }
}
