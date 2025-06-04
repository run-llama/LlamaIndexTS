import { Document } from "@llamaindex/core/schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeaviateVectorStore } from "../src/WeaviateVectorStore";
import {
  mockClient,
  mockCollection,
  setupMockEmbedding,
} from "./mocks/weaviate.mocks";

// Mock the weaviate-client module
vi.mock("weaviate-client", () => {
  return {
    default: {
      connectToWeaviateCloud: vi.fn(() => Promise.resolve(mockClient)),
      ApiKey: vi.fn(),
    },
    connectToWeaviateCloud: vi.fn(() => Promise.resolve(mockClient)),
    ApiKey: vi.fn(),
  };
});

describe("sanitize", () => {
  // Shared test data
  const testCloudOptions = {
    clusterURL: "https://test-cluster.weaviate.network",
    apiKey: "test-api-key",
  };

  const testDocument = new Document({
    text: "This is a test document for embedding.",
    metadata: {
      source: "whatever",
      "hyphenated-column-name": "foobar", // Invalid GraphQL property name
    },
    embedding: [0.1, 0.2, 0.3],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up embedding model for tests
    setupMockEmbedding();
  });

  describe("metadata property name sanitization", () => {
    it("should throw Weaviate error when sanitization is disabled and property names are invalid", async () => {
      // Setup mock to return an error for invalid property names
      mockCollection.data.insertMany.mockResolvedValue({
        hasErrors: true,
        errors: {
          "0": {
            message:
              "'hyphenated-column-name' is not a valid nested property name of 'metadata'. NestedProperty names in Weaviate are restricted to valid GraphQL names, which must be \"/[_A-Za-z][_0-9A-Za-z]*/\".",
          },
        },
        uuids: {},
      });

      const vectorStore = new WeaviateVectorStore({
        cloudOptions: testCloudOptions,
        sanitizeMetadata: false,
      });

      await expect(vectorStore.add([testDocument])).rejects.toThrow(
        "Failed to add nodes to Weaviate",
      );
    });

    it("should automatically sanitize invalid property names when sanitization is enabled", async () => {
      // Setup mock to return success
      mockCollection.data.insertMany.mockResolvedValue({
        hasErrors: false,
        errors: {},
        uuids: { "0": "test-uuid-1" },
      });

      const vectorStore = new WeaviateVectorStore({
        cloudOptions: testCloudOptions,
        sanitizeMetadata: true,
      });

      const result = await vectorStore.add([testDocument]);

      // Verify that insertMany was called with sanitized metadata
      expect(mockCollection.data.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({
          properties: expect.objectContaining({
            // The hyphenated key should be sanitized to use underscores
            hyphenated_column_name: "foobar",
            source: "whatever",
            text: "This is a test document for embedding.",
          }),
        }),
      ]);

      expect(result).toEqual(["test-uuid-1"]);
    });

    it("should sanitize property names by default when sanitizeMetadata option is not specified", async () => {
      // Setup mock to return success
      mockCollection.data.insertMany.mockResolvedValue({
        hasErrors: false,
        errors: {},
        uuids: { "0": "test-uuid-1" },
      });

      const vectorStore = new WeaviateVectorStore({
        cloudOptions: testCloudOptions,
        // sanitizeMetadata not specified, should default to true
      });

      await vectorStore.add([testDocument]);

      // Verify that insertMany was called with sanitized metadata (default behavior)
      expect(mockCollection.data.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({
          properties: expect.objectContaining({
            hyphenated_column_name: "foobar", // sanitized
            source: "whatever",
            text: "This is a test document for embedding.",
          }),
        }),
      ]);
    });
  });
});
