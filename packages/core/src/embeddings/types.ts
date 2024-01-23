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

export type Embedding = number[];

const DEFAULT_EMBED_BATCH_SIZE = 10;

/**
 * Base embedding class
 */
export abstract class BaseEmbedding {
  embedBatchSize = DEFAULT_EMBED_BATCH_SIZE;

  similarity(
    embedding1: Embedding,
    embedding2: Embedding,
    mode: SimilarityType = SimilarityType.DEFAULT,
  ): number {
    return similarity(embedding1, embedding2, mode);
  }

  abstract getTextEmbedding(textS: string | string[]): Promise<Embedding>;
  abstract getQueryEmbedding(query: string): Promise<Embedding>;

  /**
   * Get embeddings for a batch of texts
   * @param texts
   * @param options
   */
  async getTextEmbeddingBatch(
    texts: string[],
    options?: {
      logProgress?: boolean;
    },
  ): Promise<Array<Embedding>> {
    const resultEmbeddings: Array<Embedding> = [];
    const chunkSize = this.embedBatchSize;

    const queue: string[] = texts;

    const curBatch = [];

    for (let i = 0; i < queue.length; i++) {
      curBatch.push(queue[i]);
      if (i == queue.length - 1 || curBatch.length == chunkSize) {
        const embeddings = await this.getTextEmbedding(curBatch);

        resultEmbeddings.push(embeddings);

        if (options?.logProgress) {
          console.log(`Embedding progress: ${i} / ${queue.length}`);
        }

        curBatch.length = 0;
      }
    }

    return resultEmbeddings;
  }
}
