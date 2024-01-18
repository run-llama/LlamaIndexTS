import { similarity, SimilarityType } from "./utils";

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
