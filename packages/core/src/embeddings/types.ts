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

export abstract class BaseEmbedding {
  similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType = SimilarityType.DEFAULT,
  ): number {
    return similarity(embedding1, embedding2, mode);
  }

  abstract getTextEmbedding(text: string): Promise<number[]>;
  abstract getQueryEmbedding(query: string): Promise<number[]>;
}
