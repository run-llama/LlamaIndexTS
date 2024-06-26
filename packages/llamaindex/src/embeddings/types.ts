import type { BaseNode } from "@llamaindex/core/schema";
import { MetadataMode } from "@llamaindex/core/schema";
import { type Tokenizers } from "@llamaindex/env";
import type { TransformComponent } from "../ingestion/types.js";
import type { MessageContentDetail } from "../llm/types.js";
import { extractSingleText } from "../llm/utils.js";
import { truncateMaxTokens } from "./tokenizer.js";
import { SimilarityType, similarity } from "./utils.js";

const DEFAULT_EMBED_BATCH_SIZE = 10;

type EmbedFunc<T> = (values: T[]) => Promise<Array<number[]>>;

export type EmbeddingInfo = {
  dimensions?: number;
  maxTokens?: number;
  tokenizer?: Tokenizers;
};

export abstract class BaseEmbedding implements TransformComponent {
  embedBatchSize = DEFAULT_EMBED_BATCH_SIZE;
  embedInfo?: EmbeddingInfo;

  similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType = SimilarityType.DEFAULT,
  ): number {
    return similarity(embedding1, embedding2, mode);
  }

  abstract getTextEmbedding(text: string): Promise<number[]>;

  async getQueryEmbedding(
    query: MessageContentDetail,
  ): Promise<number[] | null> {
    const text = extractSingleText(query);
    if (text) {
      return await this.getTextEmbedding(text);
    }
    return null;
  }

  /**
   * Optionally override this method to retrieve multiple embeddings in a single request
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
    return await batchEmbeddings(
      texts,
      this.getTextEmbeddings.bind(this),
      this.embedBatchSize,
      options,
    );
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    const texts = nodes.map((node) => node.getContent(MetadataMode.EMBED));

    const embeddings = await this.getTextEmbeddingsBatch(texts, _options);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].embedding = embeddings[i];
    }

    return nodes;
  }

  truncateMaxTokens(input: string[]): string[] {
    return input.map((s) => {
      // truncate to max tokens
      if (!(this.embedInfo?.tokenizer && this.embedInfo?.maxTokens)) return s;
      return truncateMaxTokens(
        this.embedInfo.tokenizer,
        s,
        this.embedInfo.maxTokens,
      );
    });
  }
}

export async function batchEmbeddings<T>(
  values: T[],
  embedFunc: EmbedFunc<T>,
  chunkSize: number,
  options?: {
    logProgress?: boolean;
  },
): Promise<Array<number[]>> {
  const resultEmbeddings: Array<number[]> = [];

  const queue: T[] = values;

  const curBatch: T[] = [];

  for (let i = 0; i < queue.length; i++) {
    curBatch.push(queue[i]);
    if (i == queue.length - 1 || curBatch.length == chunkSize) {
      const embeddings = await embedFunc(curBatch);

      resultEmbeddings.push(...embeddings);

      if (options?.logProgress) {
        console.log(`getting embedding progress: ${i} / ${queue.length}`);
      }

      curBatch.length = 0;
    }
  }

  return resultEmbeddings;
}
