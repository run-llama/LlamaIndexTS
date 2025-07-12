import {
  BaseEmbedding,
  batchEmbeddings,
  truncateMaxTokens,
  type BaseEmbeddingOptions,
} from "@llamaindex/core/embeddings";
import { Tokenizers, tokenizers } from "@llamaindex/env/tokenizers";
import { describe, expect, test } from "vitest";

describe("truncateMaxTokens", () => {
  const tokenizer = tokenizers.tokenizer(Tokenizers.CL100K_BASE);

  test("should not truncate if less or equal to max tokens", () => {
    const text = "Hello".repeat(40);
    const t = truncateMaxTokens(Tokenizers.CL100K_BASE, text, 40);
    expect(t.length).toEqual(text.length);
  });

  test("should truncate if more than max tokens", () => {
    const text = "Hello".repeat(40);
    const t = truncateMaxTokens(Tokenizers.CL100K_BASE, text, 20);
    expect(tokenizer.encode(t).length).toBe(20);
  });

  test("should work with UTF8-boundaries", () => {
    // "爨" has two tokens in CL100K_BASE
    const text = "爨".repeat(40);
    // truncate at utf-8 boundary
    const t = truncateMaxTokens(Tokenizers.CL100K_BASE, text, 39);
    // has to remove one token to keep the boundary
    expect(tokenizer.encode(t).length).toBe(38);
    expect(t.includes("�")).toBe(false);
  });
});

describe("BaseEmbedding progressCallback", () => {
  const mockEmbedFunc = async (text: string): Promise<number[]> => {
    return Array.from({ length: 10 }, () => Math.random());
  };
  const mockBatchEmbedFunc = async (
    texts: string[],
  ): Promise<Array<number[]>> => {
    return await Promise.all(texts.map(mockEmbedFunc));
  };
  const mockProgressCallback = (current: number, total: number) => {
    console.log(`Progress: ${current}/${total}`);
  };
  const mockLogProgress = true;

  const mockOptions = {
    logProgress: mockLogProgress,
    progressCallback: mockProgressCallback,
  };

  class MockEmbedding extends BaseEmbedding {
    constructor(options: BaseEmbeddingOptions) {
      super();
      this.options = options;
    }

    private options: BaseEmbeddingOptions;

    async getTextEmbedding(text: string): Promise<number[]> {
      return await mockEmbedFunc(text);
    }

    getTextEmbeddings = async (texts: string[]): Promise<Array<number[]>> => {
      return await mockBatchEmbedFunc(texts);
    };

    async getTextEmbeddingsBatch(
      texts: string[],
      options?: BaseEmbeddingOptions,
    ): Promise<Array<number[]>> {
      const mergedOptions = { ...this.options, ...options };

      expect(mergedOptions.progressCallback).toBeDefined();

      return await batchEmbeddings(
        texts,
        this.getTextEmbeddings,
        this.embedBatchSize,
        mergedOptions,
      );
    }
  }

  test("should call progressCallback with correct values", async () => {
    // Import and use a real embedding class instead

    const progressCalls: Array<{ current: number; total: number }> = [];
    const progressCallback = (current: number, total: number) => {
      progressCalls.push({ current, total });
    };
    const texts = ["text1", "text2", "text3"];
    const embedding = new MockEmbedding({ progressCallback: progressCallback });
    embedding.embedBatchSize = 1; // Set batch size to 1 for testing
    // so that progressCallback is called for each item
    // (otherwise, we'd only get a callback for 3/3, which is fine but less clear)
    await embedding.getTextEmbeddingsBatch(texts);

    expect(progressCalls).toEqual([
      { current: 1, total: 3 },
      { current: 2, total: 3 },
      { current: 3, total: 3 },
    ]);
  });
});
