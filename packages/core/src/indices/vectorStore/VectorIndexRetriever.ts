import { globalsHelper } from "../../GlobalsHelper.js";
import { ImageNode, Metadata, NodeWithScore } from "../../Node.js";
import { BaseRetriever } from "../../Retriever.js";
import { ServiceContext } from "../../ServiceContext.js";
import { Event } from "../../callbacks/CallbackManager.js";
import { DEFAULT_SIMILARITY_TOP_K } from "../../constants.js";
import { BaseEmbedding } from "../../embeddings/index.js";
import {
  MetadataFilters,
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
} from "../../storage/vectorStore/types.js";
import { VectorStoreIndex } from "./VectorStoreIndex.js";

/**
 * VectorIndexRetriever retrieves nodes from a VectorIndex.
 */

export type VectorIndexRetrieverOptions = {
  index: VectorStoreIndex;
  similarityTopK?: number;
  imageSimilarityTopK?: number;
};

export class VectorIndexRetriever implements BaseRetriever {
  index: VectorStoreIndex;
  similarityTopK: number;
  imageSimilarityTopK: number;
  private serviceContext: ServiceContext;

  constructor({
    index,
    similarityTopK,
    imageSimilarityTopK,
  }: VectorIndexRetrieverOptions) {
    this.index = index;
    this.serviceContext = this.index.serviceContext;
    this.similarityTopK = similarityTopK ?? DEFAULT_SIMILARITY_TOP_K;
    this.imageSimilarityTopK = imageSimilarityTopK ?? DEFAULT_SIMILARITY_TOP_K;
  }

  async retrieve(
    query: string,
    parentEvent?: Event,
    preFilters?: MetadataFilters,
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
    preFilters?: MetadataFilters,
  ): Promise<NodeWithScore[]> {
    const options = {};
    const q = await this.buildVectorStoreQuery(
      this.index.embedModel,
      query,
      this.similarityTopK,
      preFilters,
    );
    const result = await this.index.vectorStore.query(q, options);
    return this.buildNodeListFromQueryResult(result);
  }

  private async textToImageRetrieve(
    query: string,
    preFilters?: MetadataFilters,
  ) {
    if (!this.index.imageEmbedModel || !this.index.imageVectorStore) {
      // no-op if image embedding and vector store are not set
      return [];
    }
    const q = await this.buildVectorStoreQuery(
      this.index.imageEmbedModel,
      query,
      this.imageSimilarityTopK,
      preFilters,
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
    similarityTopK: number,
    preFilters?: MetadataFilters,
  ): Promise<VectorStoreQuery> {
    const queryEmbedding = await embedModel.getQueryEmbedding(query);

    return {
      queryEmbedding: queryEmbedding,
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK: similarityTopK,
      filters: preFilters ?? undefined,
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
      // XXX: Hack, if it's an image node, we reconstruct the image from the URL
      // Alternative: Store image in doc store and retrieve it here
      if (node instanceof ImageNode) {
        node.image = node.getUrl();
      }

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
