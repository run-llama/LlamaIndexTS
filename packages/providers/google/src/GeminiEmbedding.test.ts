import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_EMBED_BATCH_SIZE,
  GEMINI_EMBEDDING_MODEL,
  GeminiEmbedding,
} from "./GeminiEmbedding";

// Mock the Google GenAI module
const mockEmbedContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      embedContent: mockEmbedContent,
    },
  })),
}));

describe("GeminiEmbedding", () => {
  let geminiEmbedding: GeminiEmbedding;
  // Move capturedBatches to outer scope so all tests can access it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let capturedBatches: any[];

  beforeEach(() => {
    vi.clearAllMocks();
    geminiEmbedding = new GeminiEmbedding({
      model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
      apiKey: "test-api-key",
    });
    // Default mock for other tests
    mockEmbedContent.mockResolvedValue({
      embeddings: [
        { values: [0.1, 0.2, 0.3] },
        { values: [0.4, 0.5, 0.6] },
        { values: [0.7, 0.8, 0.9] },
      ],
    });
  });

  describe("getTextEmbeddingsBatch", () => {
    beforeEach(() => {
      // Reset and set up capturedBatches and the mock implementation for all tests in this suite
      capturedBatches = [];
      mockEmbedContent.mockImplementation((args) => {
        capturedBatches.push({
          ...args,
          contents: Array.isArray(args.contents)
            ? [...args.contents]
            : args.contents,
        });
        return Promise.resolve({
          embeddings: Array.from(
            { length: Array.isArray(args.contents) ? args.contents.length : 1 },
            (_, i) => ({
              values: [i * 0.1, i * 0.2, i * 0.3],
            }),
          ),
        });
      });
    });

    test("should respect batch size limit of 10 for texts longer than 10", async () => {
      // Create a list of 2.5x the batch size texts, to exceed the batch size
      const texts = Array.from(
        { length: DEFAULT_EMBED_BATCH_SIZE * 2.5 },
        (_, i) => `text ${i + 1}`,
      );

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Verify that embedContent was called exactly 3 times (ceil(250/100) = 3)
      expect(mockEmbedContent).toHaveBeenCalledTimes(3);
      // Verify that each call had no more than 100 texts
      const calls = mockEmbedContent.mock.calls;

      // First batch should have DEFAULT_EMBED_BATCH_SIZE texts
      expect(capturedBatches[0].contents).toHaveLength(
        DEFAULT_EMBED_BATCH_SIZE,
      );
      expect(capturedBatches[0].contents).toEqual(
        texts.slice(0 * DEFAULT_EMBED_BATCH_SIZE, 1 * DEFAULT_EMBED_BATCH_SIZE),
      );

      // Second batch should have DEFAULT_EMBED_BATCH_SIZE texts
      expect(capturedBatches[1].contents).toHaveLength(
        DEFAULT_EMBED_BATCH_SIZE,
      );
      expect(capturedBatches[1].contents).toEqual(
        texts.slice(1 * DEFAULT_EMBED_BATCH_SIZE, 2 * DEFAULT_EMBED_BATCH_SIZE),
      );

      // Third batch should have 0.5 * DEFAULT_EMBED_BATCH_SIZE texts (remaining)
      expect(capturedBatches[2].contents).toHaveLength(
        DEFAULT_EMBED_BATCH_SIZE * 0.5,
      );
      expect(capturedBatches[2].contents).toEqual(
        texts.slice(
          2 * DEFAULT_EMBED_BATCH_SIZE,
          2.5 * DEFAULT_EMBED_BATCH_SIZE,
        ),
      );
    });

    test("should handle exactly DEFAULT_EMBED_BATCH_SIZE texts in a single batch", async () => {
      const texts = Array.from(
        { length: DEFAULT_EMBED_BATCH_SIZE },
        (_, i) => `text ${i + 1}`,
      );

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Should be called exactly once
      expect(mockEmbedContent).toHaveBeenCalledTimes(1);
      // // Should contain all 100 texts
      expect(capturedBatches[0]?.contents).toHaveLength(
        DEFAULT_EMBED_BATCH_SIZE,
      );
      expect(capturedBatches[0]?.contents).toEqual(texts);
    });

    test("should handle texts shorter than batch size", async () => {
      const short_batch_length = 5; // Less than DEFAULT_EMBED_BATCH_SIZE
      const texts = Array.from(
        { length: short_batch_length },
        (_, i) => `text ${i + 1}`,
      );

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Should be called exactly once
      expect(mockEmbedContent).toHaveBeenCalledTimes(1);

      // Should contain all 5 texts
      expect(capturedBatches[0].contents).toHaveLength(short_batch_length);
      expect(capturedBatches[0].contents).toEqual(texts);
    });

    test("should handle large batches correctly (100 texts)", async () => {
      const n_batches = 10;
      const texts = Array.from(
        { length: DEFAULT_EMBED_BATCH_SIZE * n_batches },
        (_, i) => `text ${i + 1}`,
      );

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Should be called exactly 10 times
      expect(mockEmbedContent).toHaveBeenCalledTimes(n_batches);

      // Verify each batch has exactly DEFAULT_EMBED_BATCH_SIZE texts
      for (let i = 0; i < n_batches; i++) {
        expect(capturedBatches[i].contents).toHaveLength(
          DEFAULT_EMBED_BATCH_SIZE,
        );
        expect(capturedBatches[i].contents).toEqual(
          texts.slice(
            i * DEFAULT_EMBED_BATCH_SIZE,
            (i + 1) * DEFAULT_EMBED_BATCH_SIZE,
          ),
        );
      }
    });

    test("should return correct embeddings for all texts", async () => {
      const texts = ["text1", "text2", "text3"];

      mockEmbedContent.mockResolvedValueOnce({
        embeddings: [
          { values: [0.1, 0.2, 0.3] },
          { values: [0.4, 0.5, 0.6] },
          { values: [0.7, 0.8, 0.9] },
        ],
      });

      const result = await geminiEmbedding.getTextEmbeddingsBatch(texts);

      expect(result).toEqual([
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9],
      ]);
    });

    test("should handle empty embeddings gracefully", async () => {
      const texts = ["text1", "text2"];

      mockEmbedContent.mockResolvedValueOnce({
        embeddings: [{ values: undefined }, { values: [0.1, 0.2, 0.3] }],
      });

      const result = await geminiEmbedding.getTextEmbeddingsBatch(texts);

      expect(result).toEqual([[], [0.1, 0.2, 0.3]]);
    });

    test("should handle missing embeddings array", async () => {
      const texts = ["text1"];

      mockEmbedContent.mockResolvedValueOnce({
        embeddings: undefined,
      });

      const result = await geminiEmbedding.getTextEmbeddingsBatch(texts);

      expect(result).toEqual([]);
    });
  });

  describe("getTextEmbedding", () => {
    test("should call embedContent with single text", async () => {
      const text = "single text";

      mockEmbedContent.mockResolvedValueOnce({
        embeddings: [{ values: [0.1, 0.2, 0.3] }],
      });

      const result = await geminiEmbedding.getTextEmbedding(text);

      expect(mockEmbedContent).toHaveBeenCalledTimes(1);
      expect(mockEmbedContent).toHaveBeenCalledWith({
        model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
        contents: text,
      });
      expect(result).toEqual([0.1, 0.2, 0.3]);
    });
  });

  describe("constructor", () => {
    test("should set default model and batch size", () => {
      const embedding = new GeminiEmbedding({ apiKey: "test-key" });

      expect(embedding.model).toBe(GEMINI_EMBEDDING_MODEL.EMBEDDING_001);
      expect(embedding.embedBatchSize).toBe(DEFAULT_EMBED_BATCH_SIZE);
    });

    test("should use provided model", () => {
      const new_batch_size = 50;
      const embedding = new GeminiEmbedding({
        model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
        apiKey: "test-key",
        embedBatchSize: new_batch_size,
      });

      expect(embedding.model).toBe(GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004);
      expect(embedding.embedBatchSize).toBe(new_batch_size);
    });
  });
});
