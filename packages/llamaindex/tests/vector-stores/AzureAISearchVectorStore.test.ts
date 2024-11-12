/* eslint-disable @typescript-eslint/no-explicit-any */
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

const createMockNodes = (n: number) => {
  return Array.from({ length: n }, (_, i) => ({
    id_: `node-${i}`,
    getEmbedding: () => [0.1, 0.2, 0.3, 0.4],
    getContent: () => `content ${i}`,
  }));
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

  // it("should add nodes to the search index", async () => {
  //   const client = createMockSearchClient();
  //   const store = new AzureAISearchVectorStore({
  //     indexClient: client as any,
  //     endpoint: "https://example.com",
  //     apiKey: "test-api-key",
  //     indexName: "test-index",
  //   } as any);

  //   const nodes = createMockNodes(10);
  //   await store.add(nodes);

  //   expect(client.uploadDocuments).toHaveBeenCalledTimes(1);
  //   expect(client.uploadDocuments).toHaveBeenCalledWith(
  //     expect.arrayContaining(
  //       nodes.map((node) =>
  //         expect.objectContaining({
  //           id: node.id_,
  //           content: node.getContent(),
  //           embedding: node.getEmbedding(),
  //         }),
  //       ),
  //     ),
  //   );
  // });

  // it("should delete nodes from the search index", async () => {
  //   const client = createMockSearchClient();
  //   const store = new AzureAISearchVectorStore({
  //     client: client as any,
  //     endpoint: "https://example.com",
  //     apiKey: "test-api-key",
  //     indexName: "test-index",
  //   });

  //   await store.delete("node-0");

  //   expect(client.deleteDocuments).toHaveBeenCalledTimes(1);
  //   expect(client.deleteDocuments).toHaveBeenCalledWith([{ id: "node-0" }]);
  // });

  // it("should retrieve nodes based on query vector", async () => {
  //   const client = createMockSearchClient();
  //   client.search.mockResolvedValue({
  //     results: [
  //       { id: "node-1", content: "content 1", embedding: [0.1, 0.2, 0.3, 0.4] },
  //       { id: "node-2", content: "content 2", embedding: [0.1, 0.2, 0.3, 0.4] },
  //     ],
  //   });
  //   const store = new AzureAISearchVectorStore({
  //     client: client as any,
  //     endpoint: "https://example.com",
  //     apiKey: "test-api-key",
  //     indexName: "test-index",
  //   });

  //   const queryVector = [0.1, 0.2, 0.3, 0.4];
  //   const result = await store.query({ queryEmbedding: queryVector, topK: 2 });

  //   expect(client.search).toHaveBeenCalledTimes(1);
  //   expect(client.search).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       vector: queryVector,
  //       top: 2,
  //     }),
  //   );
  //   expect(result).toHaveLength(2);
  //   expect(result[0].id).toBe("node-1");
  //   expect(result[1].id).toBe("node-2");
  // });

  // it("should throw an error if query vector is missing", async () => {
  //   const client = createMockSearchClient();
  //   const store = new AzureAISearchVectorStore({
  //     client: client as any,
  //     endpoint: "https://example.com",
  //     apiKey: "test-api-key",
  //     indexName: "test-index",
  //   });

  //   await expect(
  //     store.query({ queryEmbedding: null, topK: 2 }),
  //   ).rejects.toThrow("Query missing embedding");
  // });
});
