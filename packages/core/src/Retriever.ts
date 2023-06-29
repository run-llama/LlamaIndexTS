import { VectorStoreIndex } from "./BaseIndex";
import { BaseEmbedding, getTopKEmbeddings } from "./Embedding";
import { NodeWithScore } from "./Node";
import { DEFAULT_SIMILARITY_TOP_K } from "./constants";

export interface BaseRetriever {
  aretrieve(query: string): Promise<any>;
}

export class VectorIndexRetriever implements BaseRetriever {
  index: VectorStoreIndex;
  similarityTopK = DEFAULT_SIMILARITY_TOP_K;
  embeddingService: BaseEmbedding;

  constructor(index: VectorStoreIndex, embeddingService: BaseEmbedding) {
    this.index = index;
    this.embeddingService = embeddingService;
  }

  async aretrieve(query: string): Promise<NodeWithScore[]> {
    const queryEmbedding = await this.embeddingService.aGetQueryEmbedding(
      query
    );
    const [similarities, ids] = getTopKEmbeddings(
      queryEmbedding,
      this.index.nodes.map((node) => node.getEmbedding()),
      undefined,
      this.index.nodes.map((node) => node.id_)
    );

    let nodesWithScores: NodeWithScore[] = [];

    for (let i = 0; i < ids.length; i++) {
      const node = this.index.indexStruct.nodesDict[ids[i]];
      nodesWithScores.push({
        node: node,
        score: similarities[i],
      });
    }

    return nodesWithScores;
  }
}
