import BlueBird from "bluebird";
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

type Embedding = number[];

const DEFAULT_EMBED_BATCH_SIZE = 10;

export abstract class BaseEmbedding {
  embedBatchSize = DEFAULT_EMBED_BATCH_SIZE;

  similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType = SimilarityType.DEFAULT,
  ): number {
    return similarity(embedding1, embedding2, mode);
  }

  abstract getTextEmbedding(text: string): Promise<number[]>;
  abstract getQueryEmbedding(query: string): Promise<number[]>;

  async getTextEmbeddingBatch(texts: string[]): Promise<Array<Embedding>> {
    const resultEmbeddings: Array<Embedding> = [];

    const queueWithProgress = texts;

    await BlueBird.map(
      queueWithProgress,
      async (text) => {
        const embedding = await this.getTextEmbedding(text);
        return embedding;
      },
      { concurrency: this.embedBatchSize },
    ).then((embeddings) => {
      resultEmbeddings.push(...embeddings);
    });

    return resultEmbeddings;
  }
}
