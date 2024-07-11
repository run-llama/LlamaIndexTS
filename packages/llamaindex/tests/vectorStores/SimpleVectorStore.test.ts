import {
  BaseEmbedding,
  BaseNode,
  SimpleVectorStore,
  TextNode,
  VectorStoreQueryMode,
} from "llamaindex";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@qdrant/js-client-rest");

describe("SimpleVectorStore", () => {
  let nodes: BaseNode[];
  let store: SimpleVectorStore;

  beforeEach(() => {
    nodes = [
      new TextNode({
        id_: "1",
        embedding: [0.1, 0.2],
        text: "The dog is brown",
        metadata: { dogId: "1", private: true },
      }),
      new TextNode({
        id_: "2",
        embedding: [0.2, 0.3],
        text: "The dog is yellow",
        metadata: { dogId: "2", private: false },
      }),
      new TextNode({
        id_: "3",
        embedding: [0.3, 0.1],
        text: "The dog is red",
        metadata: { dogId: "3", private: false },
      }),
    ];
    store = new SimpleVectorStore({
      embedModel: {} as BaseEmbedding, // Mocking the embedModel
      data: {
        embeddingDict: {},
        textIdToRefDocId: {},
        metadataDict: {
          // Mocking the metadataDict
          "1": { dogId: "1", private: true },
          "2": { dogId: "2", private: false },
          "3": { dogId: "3", private: false },
        },
      },
    });
  });

  describe("[SimpleVectorStore]", () => {
    it("able to add nodes to store", async () => {
      const ids = await store.add(nodes);
      expect(ids).length(3);
    });
    it("able to query nodes without filter", async () => {
      await store.add(nodes);
      const result = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 3,
        mode: VectorStoreQueryMode.DEFAULT,
      });
      expect(result.similarities).length(3);
    });
    it("able to query nodes with filter EQ", async () => {
      await store.add(nodes);
      const result = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 3,
        mode: VectorStoreQueryMode.DEFAULT,
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "==",
            },
          ],
        },
      });
      expect(result.similarities).length(2);
    });
    it("able to query nodes with filter IN", async () => {
      await store.add(nodes);
      const result = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 3,
        mode: VectorStoreQueryMode.DEFAULT,
        filters: {
          filters: [
            {
              key: "dogId",
              value: ["1", "3"],
              operator: "in",
            },
          ],
        },
      });
      expect(result.similarities).length(2);
    });
  });
});
