export enum SimilarityType {
  DEFAULT = "cosine",
  DOT_PRODUCT = "dot_product",
  EUCLIDEAN = "euclidean",
}

export class BaseEmbedding {
  getQueryEmbedding(query: string): number[] {
    return [];
  }

  getTextEmbedding(text: string): number[] {
    return [];
  }

  similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType
  ): number {
    return 0;
  }
}

enum OpenAIEmbeddingModelType {
  TEXT_EMBED_ADA_002 = "text-embedding-ada-002",
}

export class OpenAIEmbedding extends BaseEmbedding {}
