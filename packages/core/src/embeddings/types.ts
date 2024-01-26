import { BaseNode, MetadataMode } from "../Node";
import { TransformComponent } from "../ingestion";
import { similarity } from "./utils";

/**
 * Similarity type
 * Default is cosine similarity. Dot product and negative Euclidean distance are also supported.
 */
export enum SimilarityType {
  DEFAULT = "cosine",
  DOT_PRODUCT = "dot_product",
  EUCLIDEAN = "euclidean",
}

export abstract class BaseEmbedding implements TransformComponent {
  similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType = SimilarityType.DEFAULT,
  ): number {
    return similarity(embedding1, embedding2, mode);
  }

  abstract getTextEmbedding(text: string): Promise<number[]>;
  abstract getQueryEmbedding(query: string): Promise<number[]>;

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    for (const node of nodes) {
      node.embedding = await this.getTextEmbedding(
        node.getContent(MetadataMode.EMBED),
      );
    }
    return nodes;
  }
}
