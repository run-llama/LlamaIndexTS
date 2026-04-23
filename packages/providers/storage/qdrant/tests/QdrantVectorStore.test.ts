import { Settings } from "@llamaindex/core/global";
import { TextNode, type BaseNode } from "@llamaindex/core/schema";
import {
  FilterOperator,
  VectorStoreQueryMode,
} from "@llamaindex/core/vector-store";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { Mocked } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestableQdrantVectorStore } from "../mocks/TestableQdrantVectorStore.js";

Settings.embedModel = new OpenAIEmbedding();
vi.mock("@qdrant/js-client-rest");

describe("QdrantVectorStore", () => {
  let store: TestableQdrantVectorStore;
  let mockQdrantClient: Mocked<QdrantClient>;

  beforeEach(() => {
    mockQdrantClient = new QdrantClient() as Mocked<QdrantClient>;
    store = new TestableQdrantVectorStore({
      client: mockQdrantClient,
      collectionName: "testCollection",
      url: "http://example.com",
      apiKey: "testApiKey",
      batchSize: 100,
    });
  });

  describe("[QdrantVectorStore] createCollection", () => {
    it("should create a new collection", async () => {
      mockQdrantClient.createCollection.mockResolvedValue(true);

      await store.createCollection("testCollection", 128);

      expect(mockQdrantClient.createCollection).toHaveBeenCalledWith(
        "testCollection",
        {
          vectors: {
            size: 128,
            distance: "Cosine",
          },
        },
      );
    });
  });

  describe("[QdrantVectorStore] add", () => {
    it("should add nodes to the vector store", async () => {
      const mockInitializeCollection = vi
        .spyOn(store, "initializeCollection")
        .mockResolvedValue();

      const mockBuildPoints = vi.spyOn(store, "buildPoints").mockResolvedValue({
        points: [{ id: "1", payload: {}, vector: [0.1, 0.2] }],
        ids: ["1"],
      });

      mockQdrantClient.upsert.mockResolvedValue({
        operation_id: 1,
        status: "completed",
      });

      const nodes: BaseNode[] = [
        new TextNode({
          embedding: [0.1, 0.2],
          metadata: { meta1: "Some metadata" },
        }),
      ];

      const ids = await store.add(nodes);

      expect(mockInitializeCollection).toHaveBeenCalledWith(
        nodes[0]!.getEmbedding().length,
      );
      expect(mockBuildPoints).toHaveBeenCalledWith(nodes);
      expect(mockQdrantClient.upsert).toHaveBeenCalled();

      expect(ids).toEqual(["1"]);
    });
  });

  describe("[QdrantVectorStore] delete", () => {
    it("should delete from the vector store", async () => {
      vi.spyOn(store, "initializeCollection").mockResolvedValue();

      vi.spyOn(store, "buildPoints").mockResolvedValue({
        points: [{ id: "1", payload: {}, vector: [0.1, 0.2] }],
        ids: ["1"],
      });

      mockQdrantClient.upsert.mockResolvedValue({
        operation_id: 1,
        status: "completed",
      });

      const nodes: BaseNode[] = [
        new TextNode({
          id_: "1",
          embedding: [0.1, 0.2],
          metadata: { meta1: "Some metadata" },
        }),
      ];

      await store.add(nodes);

      expect(store.getNodes()).toContain(nodes[0]);

      await store.delete("1");

      expect(store.getNodes()).not.toContain(nodes[0]);
      expect(mockQdrantClient.upsert).toHaveBeenCalled();
    });
  });

  describe("[QdrantVectorStore] search", () => {
    it("should search in the vector store", async () => {
      mockQdrantClient.query.mockResolvedValue({
        points: [
          {
            id: "1",
            score: 0.1,
            version: 1,
            payload: {
              _node_content: JSON.stringify({ text: "hello world" }),
            },
          },
        ],
      });

      const searchResult = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
      });

      expect(mockQdrantClient.query).toHaveBeenCalled();
      expect(searchResult.ids).toEqual(["1"]);
      expect(searchResult.similarities).toEqual([0.1]);
    });
  });

  describe("[QdrantVectorStore] search with id as number", () => {
    it("should search in the vector store with id as number", async () => {
      mockQdrantClient.query.mockResolvedValue({
        points: [
          {
            id: 1,
            score: 0.1,
            version: 1,
            payload: {
              _node_content: JSON.stringify({ text: "hello world" }),
            },
          },
        ],
      });

      const searchResult = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
      });

      expect(mockQdrantClient.query).toHaveBeenCalled();
      expect(searchResult.ids).toEqual(["1"]);
      expect(searchResult.similarities).toEqual([0.1]);
    });
  });

  describe("[QdrantVectorStore] search with params", () => {
    it("should search in the vector store with custom params", async () => {
      mockQdrantClient.query.mockResolvedValue({
        points: [
          {
            id: "1",
            score: 0.1,
            version: 1,
            payload: {
              _node_content: JSON.stringify({ text: "hello world" }),
            },
          },
        ],
      });

      const searchResult = await store.query(
        {
          queryEmbedding: [0.1, 0.2],
          similarityTopK: 1,
          mode: VectorStoreQueryMode.DEFAULT,
        },
        {
          // FIX: Use qdrant_search_params to match the provider's implementation
          qdrant_search_params: {
            hnsw_ef: 10,
          },
        },
      );

      expect(mockQdrantClient.query).toHaveBeenCalledWith(
        "testCollection",
        expect.objectContaining({
          params: { hnsw_ef: 10 },
        }),
      );
      expect(searchResult.ids).toEqual(["1"]);
    });
  });

  describe("[QdrantVectorStore] search with pre-filters", () => {
    it("should correctly map NE (Not Equal) to Qdrant must_not filter", async () => {
      mockQdrantClient.query.mockResolvedValue({ points: [] });

      await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
        filters: {
          filters: [
            { key: "status", value: "archived", operator: FilterOperator.NE },
          ],
        },
      });

      // FIX: Match the cleaner, flattened output produced by buildQueryFilter
      expect(mockQdrantClient.query).toHaveBeenCalledWith(
        "testCollection",
        expect.objectContaining({
          filter: {
            must: [
              {
                must_not: [{ key: "status", match: { value: "archived" } }],
              },
            ],
          },
        }),
      );
    });

    it("should correctly map NIN (Not In) to Qdrant must_not filter with any", async () => {
      mockQdrantClient.query.mockResolvedValue({ points: [] });

      await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
        filters: {
          filters: [
            {
              key: "category",
              value: ["electronics", "toys"],
              operator: FilterOperator.NIN,
            },
          ],
        },
      });

      expect(mockQdrantClient.query).toHaveBeenCalledWith(
        "testCollection",
        expect.objectContaining({
          filter: {
            must: [
              {
                must_not: [
                  { key: "category", match: { any: ["electronics", "toys"] } },
                ],
              },
            ],
          },
        }),
      );
    });

    it("should preserve numeric types in IN filters", async () => {
      mockQdrantClient.query.mockResolvedValue({ points: [] });

      await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
        filters: {
          filters: [
            { key: "version", value: [1, 2], operator: FilterOperator.IN },
          ],
        },
      });

      // FIX: Match the cleaner, flattened output produced by buildQueryFilter
      expect(mockQdrantClient.query).toHaveBeenCalledWith(
        "testCollection",
        expect.objectContaining({
          filter: {
            must: [{ key: "version", match: { any: [1, 2] } }],
          },
        }),
      );
    });
  });
});
