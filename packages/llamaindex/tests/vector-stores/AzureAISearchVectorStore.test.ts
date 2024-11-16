/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MetadataMode,
  type BaseNode,
  type Metadata,
} from "@llamaindex/core/schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AzureAISearchVectorStore } from "../../src/vector-store.js";

function createMockSearchClient() {
  return {
    uploadDocuments: vi.fn().mockResolvedValue({}),
    deleteDocuments: vi.fn().mockResolvedValue({}),
    search: vi.fn().mockResolvedValue({
      results: [],
    }),
  };
}

const createMockNodes = (n: number): BaseNode<Metadata>[] => {
  return Array.from({ length: n }, (_, i) => ({
    id: `node-${i}`,
    doc_id: `doc-${i}`,
    content: `content ${i}`,
    embedding: [0.1, 0.2, 0.3, 0.4],
    metadata: {
      file_name: `file-${i}.txt`,
      file_path: `/path/to/file-${i}.txt`,
    },
    getContent: () => `content ${i}`,
    getEmbedding: () => [0.1, 0.2, 0.3, 0.4],
  })) as unknown as BaseNode<Metadata>[];
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AzureAISearchVectorStore Tests", () => {
  it("should initialize searchClient correctly", async () => {
    const searchClient = createMockSearchClient();
    const store = new AzureAISearchVectorStore({
      searchClient,
      endpoint: "https://example.com",
      apiKey: "test-api-key",
    } as any);

    expect(store).toBeDefined();
    expect(store.client).toBe(searchClient);
  });
  it("should initialize searchClient correctly", async () => {
    const indexClient = createMockSearchClient();
    const store = new AzureAISearchVectorStore({
      indexClient,
      endpoint: "https://example.com",
      apiKey: "test-api-key",
    } as any);

    expect(store).toBeDefined();
    expect(store.client).toBe(indexClient);
  });

  it("should add nodes to the search index", async () => {
    const searchClient = createMockSearchClient();
    const store = new AzureAISearchVectorStore({
      searchClient,
      endpoint: "https://example.com",
      apiKey: "test-api-key",
      indexName: "test-index",
    } as any);

    const nodes = createMockNodes(10);
    await store.add(nodes);

    expect(searchClient.uploadDocuments).toHaveBeenCalledTimes(1);
    expect(searchClient.uploadDocuments).toHaveBeenCalledWith(
      expect.arrayContaining(
        nodes.map((node) =>
          expect.objectContaining({
            id: node.id_,
            content: node.getContent(MetadataMode.ALL),
            embedding: node.getEmbedding(),
          }),
        ),
      ),
    );
  });

  it("should delete nodes from the search index", async () => {
    const searchClient = createMockSearchClient();
    const store = new AzureAISearchVectorStore({
      searchClient,
      endpoint: "https://example.com",
      apiKey: "test-api-key",
      indexName: "test-index",
    } as any);

    await store.delete("node-0");

    expect(searchClient.deleteDocuments).toHaveBeenCalledTimes(1);
    expect(searchClient.deleteDocuments).toHaveBeenCalledWith([
      { id: "node-0" },
    ]);
  });

  it("should retrieve nodes based on query vector", async () => {
    const searchClient = createMockSearchClient();
    searchClient.search.mockResolvedValue({
      results: [
        { id: "node-1", content: "content 1", embedding: [0.1, 0.2, 0.3, 0.4] },
        { id: "node-2", content: "content 2", embedding: [0.1, 0.2, 0.3, 0.4] },
      ],
    });
    const store = new AzureAISearchVectorStore({
      searchClient,
      endpoint: "https://example.com",
      apiKey: "test-api-key",
      indexName: "test-index",
    } as any);

    const queryVector = [0.1, 0.2, 0.3, 0.4];
    const result = await store.query({
      queryEmbedding: queryVector,
      topK: 2,
    } as any);

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenCalledWith(
      expect.objectContaining({
        vector: queryVector,
        top: 2,
      }),
    );
    expect(result).toHaveLength(2);
    expect(result.nodes?.[0]?.id_).toBe("node-1");
    expect(result.nodes?.[1]?.id_).toBe("node-2");
  });

  it("should throw an error if query vector is missing", async () => {
    const searchClient = createMockSearchClient();
    const store = new AzureAISearchVectorStore({
      searchClient,
      endpoint: "https://example.com",
      apiKey: "test-api-key",
      indexName: "test-index",
    } as any);

    await expect(store.query({} as any)).rejects.toThrow(
      "Query missing embedding",
    );
  });
});
