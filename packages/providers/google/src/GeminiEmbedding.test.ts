import { beforeEach, describe, expect, test, vi } from "vitest";
import { GEMINI_EMBEDDING_MODEL, GeminiEmbedding } from "./GeminiEmbedding";

// Mock the Google GenAI module
const mockEmbedContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      embedContent: mockEmbedContent,
    },
  })),
}));

// Mock the environment module
vi.mock("@llamaindex/env", () => ({
  getEnv: vi.fn().mockReturnValue("mock-api-key"),
}));

describe("GeminiEmbedding", () => {
  let geminiEmbedding: GeminiEmbedding;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a new instance for each test
    geminiEmbedding = new GeminiEmbedding({
      model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
      apiKey: "test-api-key",
    });

    // Default mock implementation returns embeddings with values
    mockEmbedContent.mockResolvedValue({
      embeddings: [
        { values: [0.1, 0.2, 0.3] },
        { values: [0.4, 0.5, 0.6] },
        { values: [0.7, 0.8, 0.9] },
      ],
    });
  });

  describe("getTextEmbeddingsBatch", () => {
    test("should respect batch size limit of 10 for texts longer than 10", async () => {
      // Create a list of 25 texts to exceed the batch size
      const texts = Array.from({ length: 25 }, (_, i) => `text ${i + 1}`);

      // Mock the embedContent to return appropriate embeddings for each batch
      mockEmbedContent
        .mockResolvedValueOnce({
          embeddings: Array.from({ length: 10 }, (_, i) => ({
            values: [i * 0.1, i * 0.2, i * 0.3],
          })),
        })
        .mockResolvedValueOnce({
          embeddings: Array.from({ length: 10 }, (_, i) => ({
            values: [(i + 10) * 0.1, (i + 10) * 0.2, (i + 10) * 0.3],
          })),
        })
        .mockResolvedValueOnce({
          embeddings: Array.from({ length: 5 }, (_, i) => ({
            values: [(i + 20) * 0.1, (i + 20) * 0.2, (i + 20) * 0.3],
          })),
        });

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Verify that embedContent was called exactly 3 times (ceil(25/10) = 3)
      expect(mockEmbedContent).toHaveBeenCalledTimes(3);

      // Verify that each call had no more than 10 texts
      const calls = mockEmbedContent.mock.calls;

      // First batch should have 10 texts
      expect(calls[0]?.[0]?.contents).toHaveLength(10);
      expect(calls[0]?.[0]?.contents).toEqual(texts.slice(0, 10));

      // Second batch should have 10 texts
      expect(calls[1]?.[0]?.contents).toHaveLength(10);
      expect(calls[1]?.[0]?.contents).toEqual(texts.slice(10, 20));

      // Third batch should have 5 texts (remaining)
      expect(calls[2]?.[0]?.contents).toHaveLength(5);
      expect(calls[2]?.[0]?.contents).toEqual(texts.slice(20, 25));
    });

    test("should handle exactly 10 texts in a single batch", async () => {
      const texts = Array.from({ length: 10 }, (_, i) => `text ${i + 1}`);

      mockEmbedContent.mockResolvedValueOnce({
        embeddings: Array.from({ length: 10 }, (_, i) => ({
          values: [i * 0.1, i * 0.2, i * 0.3],
        })),
      });

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Should be called exactly once
      expect(mockEmbedContent).toHaveBeenCalledTimes(1);

      // Should contain all 10 texts
      expect(mockEmbedContent.mock.calls[0]?.[0]?.contents).toHaveLength(10);
      expect(mockEmbedContent.mock.calls[0]?.[0]?.contents).toEqual(texts);
    });

    test("should handle texts shorter than batch size", async () => {
      const texts = Array.from({ length: 5 }, (_, i) => `text ${i + 1}`);

      mockEmbedContent.mockResolvedValueOnce({
        embeddings: Array.from({ length: 5 }, (_, i) => ({
          values: [i * 0.1, i * 0.2, i * 0.3],
        })),
      });

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Should be called exactly once
      expect(mockEmbedContent).toHaveBeenCalledTimes(1);

      // Should contain all 5 texts
      expect(mockEmbedContent.mock.calls[0]?.[0]?.contents).toHaveLength(5);
      expect(mockEmbedContent.mock.calls[0]?.[0]?.contents).toEqual(texts);
    });

    test("should handle large batches correctly (100 texts)", async () => {
      const texts = Array.from({ length: 100 }, (_, i) => `text ${i + 1}`);

      // Mock 10 calls (100/10 = 10 batches)
      for (let i = 0; i < 10; i++) {
        mockEmbedContent.mockResolvedValueOnce({
          embeddings: Array.from({ length: 10 }, (_, j) => ({
            values: [
              (i * 10 + j) * 0.1,
              (i * 10 + j) * 0.2,
              (i * 10 + j) * 0.3,
            ],
          })),
        });
      }

      await geminiEmbedding.getTextEmbeddingsBatch(texts);

      // Should be called exactly 10 times
      expect(mockEmbedContent).toHaveBeenCalledTimes(10);

      // Verify each batch has exactly 10 texts
      const calls = mockEmbedContent.mock.calls;
      for (let i = 0; i < 10; i++) {
        expect(calls[i]?.[0]?.contents).toHaveLength(10);
        expect(calls[i]?.[0]?.contents).toEqual(
          texts.slice(i * 10, (i + 1) * 10),
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
      expect(embedding.embedBatchSize).toBe(10);
    });

    test("should use provided model", () => {
      const embedding = new GeminiEmbedding({
        model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
        apiKey: "test-key",
      });

      expect(embedding.model).toBe(GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004);
    });
  });
});
