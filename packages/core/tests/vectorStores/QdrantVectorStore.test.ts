import { BaseNode, TextNode } from "llamaindex/Node";
import { Mocked, beforeEach, describe, expect, it, vi } from "vitest";

import { QdrantClient } from "@qdrant/js-client-rest";
import { VectorStoreQueryMode } from "llamaindex/storage/index";
import { TestableQdrantVectorStore } from "../mocks/TestableQdrantVectorStore.js";

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

    describe("[QdrantVectorStore] add", () => {
      it("should add nodes to the vector store", async () => {
        // Mocking the dependent methods and Qdrant client responses
        const mockInitializeCollection = vi
          .spyOn(store, "initializeCollection")
          .mockResolvedValue();

        const mockBuildPoints = vi
          .spyOn(store, "buildPoints")
          .mockResolvedValue({
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
          nodes[0].getEmbedding().length,
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
        mockQdrantClient.search.mockResolvedValue([
          {
            id: "1",
            score: 0.1,
            version: 1,
            payload: { _node_content: JSON.stringify({ text: "hello world" }) },
          },
        ]);

        const searchResult = await store.query({
          queryEmbedding: [0.1, 0.2],
          similarityTopK: 1,
          mode: VectorStoreQueryMode.DEFAULT,
        });

        expect(mockQdrantClient.search).toHaveBeenCalled();
        expect(searchResult.ids).toEqual(["1"]);
        expect(searchResult.similarities).toEqual([0.1]);
      });
    });
  });
});
