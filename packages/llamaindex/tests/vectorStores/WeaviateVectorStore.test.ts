import type { BaseNode } from "@llamaindex/core/schema";
import { TextNode } from "@llamaindex/core/schema";
import {
  VectorStoreQueryMode,
  WeaviateVectorStore,
  type MetadataFilters,
} from "llamaindex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestableWeaviateVectorStore } from "../mocks/TestableWeaviateVectorStore.js";

type FilterTestCase = {
  title: string;
  filters?: MetadataFilters;
  expected: number;
  mockResultIds: string[];
};

describe("WeaviateVectorStore", () => {
  let store: WeaviateVectorStore;
  let nodes: BaseNode[];

  beforeEach(() => {
    store = new TestableWeaviateVectorStore();
    nodes = [
      new TextNode({
        id_: "1",
        embedding: [0.1, 0.2],
        text: "The dog is brown",
        metadata: {
          name: "Anakin",
          dogId: "1",
          private: "true",
          weight: 1.2,
          type: ["husky", "puppy"],
        },
      }),
      new TextNode({
        id_: "2",
        embedding: [0.1, 0.2],
        text: "The dog is yellow",
        metadata: {
          name: "Luke",
          dogId: "2",
          private: "false",
          weight: 2.3,
          type: ["puppy"],
        },
      }),
      new TextNode({
        id_: "3",
        embedding: [0.1, 0.2],
        text: "The dog is red",
        metadata: {
          name: "Leia",
          dogId: "3",
          private: "false",
          weight: 3.4,
          type: ["husky"],
        },
      }),
    ];
  });

  describe("[WeaviateVectorStore] manage nodes", () => {
    it("able to add nodes to store", async () => {
      const ids = await store.add(nodes);
      expect(ids).length(3);
    });
  });

  describe("[WeaviateVectorStore] filter nodes with supported operators", () => {
    const testcases: FilterTestCase[] = [
      {
        title: "No filter",
        expected: 3,
        mockResultIds: ["1", "2", "3"],
      },
      {
        title: "Filter EQ",
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "==",
            },
          ],
        },
        expected: 2,
        mockResultIds: ["2", "3"],
      },
      {
        title: "Filter NE",
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "!=",
            },
          ],
        },
        expected: 1,
        mockResultIds: ["1"],
      },
      {
        title: "Filter GT",
        filters: {
          filters: [
            {
              key: "weight",
              value: 2.3,
              operator: ">",
            },
          ],
        },
        expected: 1,
        mockResultIds: ["3"],
      },
      {
        title: "Filter GTE",
        filters: {
          filters: [
            {
              key: "weight",
              value: 2.3,
              operator: ">=",
            },
          ],
        },
        expected: 2,
        mockResultIds: ["2", "3"],
      },
      {
        title: "Filter LT",
        filters: {
          filters: [
            {
              key: "weight",
              value: 2.3,
              operator: "<",
            },
          ],
        },
        expected: 1,
        mockResultIds: ["1"],
      },
      {
        title: "Filter LTE",
        filters: {
          filters: [
            {
              key: "weight",
              value: 2.3,
              operator: "<=",
            },
          ],
        },
        expected: 2,
        mockResultIds: ["1", "2"],
      },
      {
        title: "Filter ANY",
        filters: {
          filters: [
            {
              key: "type",
              value: ["husky", "puppy"],
              operator: "any",
            },
          ],
        },
        expected: 2,
        mockResultIds: ["1", "3"],
      },
      {
        title: "Filter ALL",
        filters: {
          filters: [
            {
              key: "type",
              value: ["husky", "puppy"],
              operator: "all",
            },
          ],
        },
        expected: 1,
        mockResultIds: ["2"],
      },
      {
        title: "Filter OR",
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "==",
            },
            {
              key: "dogId",
              value: ["1", "3"],
              operator: "in",
            },
          ],
          condition: "or",
        },
        expected: 3,
        mockResultIds: ["1", "2", "3"],
      },
      {
        title: "Filter AND",
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "==",
            },
            {
              key: "dogId",
              value: "10",
              operator: "==",
            },
          ],
          condition: "and",
        },
        expected: 0,
        mockResultIds: [],
      },
    ];

    testcases.forEach((tc) => {
      it(`[${tc.title}] should return ${tc.expected} nodes`, async () => {
        vi.spyOn(store, "query").mockResolvedValue({
          ids: tc.mockResultIds,
          similarities: [0.1, 0.2, 0.3],
        });

        await store.add(nodes);
        const result = await store.query({
          queryEmbedding: [0.1, 0.2],
          similarityTopK: 3,
          mode: VectorStoreQueryMode.DEFAULT,
          filters: tc.filters,
        });
        expect(result.ids).length(tc.expected);
      });
    });
  });
});
