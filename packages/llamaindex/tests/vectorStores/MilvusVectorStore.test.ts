import type { BaseNode } from "@llamaindex/core/schema";
import { TextNode } from "@llamaindex/core/schema";
import {
  MilvusVectorStore,
  VectorStoreQueryMode,
  type MetadataFilters,
} from "llamaindex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestableMilvusVectorStore } from "../mocks/TestableMilvusVectorStore.js";

type FilterTestCase = {
  title: string;
  filters?: MetadataFilters;
  expected: number;
  expectedFilterStr: string | undefined;
  mockResultIds: string[];
};

describe("MilvusVectorStore", () => {
  let store: MilvusVectorStore;
  let nodes: BaseNode[];

  beforeEach(() => {
    store = new TestableMilvusVectorStore();
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

  describe("[MilvusVectorStore] manage nodes", () => {
    it("able to add nodes to store", async () => {
      const ids = await store.add(nodes);
      expect(ids).length(3);
    });
  });

  describe("[MilvusVectorStore] filter nodes with supported operators", () => {
    const testcases: FilterTestCase[] = [
      {
        title: "No filter",
        expected: 3,
        mockResultIds: ["1", "2", "3"],
        expectedFilterStr: undefined,
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
        expectedFilterStr: 'metadata["private"] == "false"',
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
        expectedFilterStr: 'metadata["private"] != "false"',
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
        expectedFilterStr: 'metadata["weight"] > 2.3',
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
        expectedFilterStr: 'metadata["weight"] >= 2.3',
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
        expectedFilterStr: 'metadata["weight"] < 2.3',
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
        expectedFilterStr: 'metadata["weight"] <= 2.3',
      },
      {
        title: "Filter IN",
        filters: {
          filters: [
            {
              key: "dogId",
              value: ["1", "3"],
              operator: "in",
            },
          ],
        },
        expected: 2,
        mockResultIds: ["1", "3"],
        expectedFilterStr: 'metadata["dogId"] in ["1", "3"]',
      },
      {
        title: "Filter NIN",
        filters: {
          filters: [
            {
              key: "name",
              value: ["Anakin", "Leia"],
              operator: "nin",
            },
          ],
        },
        expected: 1,
        mockResultIds: ["2"],
        expectedFilterStr:
          'metadata["name"] != "Anakin" && metadata["name"] != "Leia"',
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
        expectedFilterStr:
          'metadata["private"] == "false" or metadata["dogId"] in ["1", "3"]',
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
        expectedFilterStr:
          'metadata["private"] == "false" and metadata["dogId"] == "10"',
      },
    ];

    testcases.forEach((tc) => {
      it(`[${tc.title}] should return ${tc.expected} nodes`, async () => {
        expect(store.toMilvusFilter(tc.filters)).toBe(tc.expectedFilterStr);

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

  describe("[MilvusVectorStore] filter nodes with unsupported operators", () => {
    const testcases: Array<
      Omit<FilterTestCase, "expectedFilterStr" | "mockResultIds">
    > = [
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
        expected: 3,
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
      },
      {
        title: "Filter CONTAINS",
        filters: {
          filters: [
            {
              key: "type",
              value: "puppy",
              operator: "contains",
            },
          ],
        },
        expected: 2,
      },
      {
        title: "Filter TEXT_MATCH",
        filters: {
          filters: [
            {
              key: "name",
              value: "Luk",
              operator: "text_match",
            },
          ],
        },
        expected: 1,
      },
    ];

    testcases.forEach((tc) => {
      it(`[Unsupported Operator] [${tc.title}] should throw error`, async () => {
        const errorMsg = `Operator ${tc.filters?.filters[0].operator} is not supported.`;
        expect(() => store.toMilvusFilter(tc.filters)).toThrow(errorMsg);
      });
    });
  });
});
