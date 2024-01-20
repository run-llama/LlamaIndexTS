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
    const chunkSize = this.embedBatchSize;

    const queue: string[] = texts;
    const totalChunks = Math.ceil(queue.length / chunkSize);

    const processChunk = async (chunk: string[], chunkIndex: number) => {
      const embeddings = await Promise.all(
        chunk.map(async (text) => {
          return await this.getTextEmbedding(text);
        }),
      );

      resultEmbeddings.push(...embeddings);
      process.stdout.write(
        `Processing chunk ${chunkIndex + 1} of ${totalChunks}.\r`,
      );
    };

    for (let i = 0; i < queue.length; i += chunkSize) {
      const chunk = queue.slice(i, i + chunkSize);
      await processChunk(chunk, i / chunkSize);
    }

    return resultEmbeddings;
  }
}
