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
    mode: SimilarityType = SimilarityType.DOT_PRODUCT
  ): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embedding length mismatch");
    }

    if (mode === SimilarityType.DOT_PRODUCT) {
      let result = 0;
      for (let i = 0; i < embedding1.length; i++) {
        result += embedding1[i] * embedding2[i];
      }
      return result;
    } else {
      throw new Error("Not implemented yet");
    }
  }
}

enum OpenAIEmbeddingModelType {
  TEXT_EMBED_ADA_002 = "text-embedding-ada-002",
}

export class OpenAIEmbedding extends BaseEmbedding {
  async aGetTextEmbedding(text: string) {}
  async aGetQueryEbmedding(query: string) {}
}
