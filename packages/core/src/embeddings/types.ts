import { BaseNode, MetadataMode } from "../Node";
import { TransformComponent } from "../ingestion";
import { SimilarityType, similarity } from "./utils";

const DEFAULT_EMBED_BATCH_SIZE = 10;

export abstract class BaseEmbedding implements TransformComponent {
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

  /**
   * Get embeddings for a batch of texts
   * @param texts
   */
  async getTextEmbeddings(texts: string[]): Promise<Array<number[]>> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.getTextEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * Get embeddings for a batch of texts
   * @param texts
   * @param options
   */
  async getTextEmbeddingsBatch(
    texts: string[],
    options?: {
      logProgress?: boolean;
    },
  ): Promise<Array<number[]>> {
    const resultEmbeddings: Array<number[]> = [];
    const chunkSize = this.embedBatchSize;

    const queue: string[] = texts;

    const curBatch: string[] = [];

    for (let i = 0; i < queue.length; i++) {
      curBatch.push(queue[i]);
      if (i == queue.length - 1 || curBatch.length == chunkSize) {
        const embeddings = await this.getTextEmbeddings(curBatch);

        resultEmbeddings.push(...embeddings);

        if (options?.logProgress) {
          console.log(`number[] progress: ${i} / ${queue.length}`);
        }

        curBatch.length = 0;
      }
    }

    return resultEmbeddings;
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    const texts = nodes.map((node) => node.getContent(MetadataMode.EMBED));

    const embeddings = await this.getTextEmbeddingsBatch(texts);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].embedding = embeddings[i];
    }

    return nodes;
  }
}
