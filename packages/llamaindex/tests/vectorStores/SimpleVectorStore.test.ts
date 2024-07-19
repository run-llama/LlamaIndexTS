import {
  BaseEmbedding,
  BaseNode,
  SimpleVectorStore,
  TextNode,
  VectorStoreQueryMode,
  type Metadata,
  type MetadataFilters,
} from "llamaindex";
import { beforeEach, describe, expect, it } from "vitest";

type FilterTestCase = {
  title: string;
  filters?: MetadataFilters;
  expected: number;
};

describe("SimpleVectorStore", () => {
  let nodes: BaseNode[];
  let store: SimpleVectorStore;

  beforeEach(() => {
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
          height: 50,
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
    store = new SimpleVectorStore({
      embedModel: {} as BaseEmbedding, // Mocking the embedModel
      data: {
        embeddingDict: {},
        textIdToRefDocId: {},
        metadataDict: nodes.reduce(
          (acc, node) => {
            acc[node.id_] = node.metadata;
            return acc;
          },
          {} as Record<string, Metadata>,
        ),
      },
    });
  });

  describe("[SimpleVectorStore] manage nodes", () => {
    it("able to add nodes to store", async () => {
      const ids = await store.add(nodes);
      expect(ids).length(3);
    });
  });

  describe("[SimpleVectorStore] query nodes", () => {
    const testcases: FilterTestCase[] = [
      {
        title: "No filter",
        expected: 3,
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
      },
    ];

    testcases.forEach((tc) => {
      it(`[${tc.title}] should return ${tc.expected} nodes`, async () => {
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

  describe("[SimpleVectorStore] query nodes with optional key in metadata", () => {
    const testcases: FilterTestCase[] = [
      {
        title: "Filter EQ with an optional key",
        filters: {
          filters: [
            {
              key: "height",
              value: 50,
              operator: "==",
            },
          ],
        },
        expected: 1,
      },
      {
        title: "Filter NE with an optional key",
        filters: {
          filters: [
            {
              key: "height",
              value: 50,
              operator: "!=",
            },
          ],
        },
        expected: 2,
      },
      {
        title: "Filter GT with an optional key",
        filters: {
          filters: [
            {
              key: "height",
              value: 48,
              operator: ">",
            },
          ],
        },
        expected: 1,
      },
      {
        title: "Filter GTE with an optional key",
        filters: {
          filters: [
            {
              key: "height",
              value: 50,
              operator: ">=",
            },
          ],
        },
        expected: 1,
      },
      {
        title: "Filter LT with an optional key",
        filters: {
          filters: [
            {
              key: "height",
              value: 50,
              operator: "<",
            },
          ],
        },
        expected: 0,
      },
      {
        title: "Filter LTE with an optional key",
        filters: {
          filters: [
            {
              key: "height",
              value: 50,
              operator: "<=",
            },
          ],
        },
        expected: 1,
      },
      {
        title: "Filter IN with an optional key",
        filters: {
          filters: [
            {
              key: "non-existing-key",
              value: ["a", "b"],
              operator: "in",
            },
          ],
        },
        expected: 0,
      },
      {
        title: "Filter NIN with an optional key",
        filters: {
          filters: [
            {
              key: "non-existing-key",
              value: ["a", "b"],
              operator: "nin",
            },
          ],
        },
        expected: 3,
      },
      {
        title: "Filter ANY with an optional key",
        filters: {
          filters: [
            {
              key: "non-existing-key",
              value: ["a", "b"],
              operator: "any",
            },
          ],
        },
        expected: 0,
      },
      {
        title: "Filter ALL with an optional key",
        filters: {
          filters: [
            {
              key: "non-existing-key",
              value: ["a", "b"],
              operator: "all",
            },
          ],
        },
        expected: 0,
      },
      {
        title: "Filter CONTAINS with an optional key",
        filters: {
          filters: [
            {
              key: "non-existing-key",
              value: "a",
              operator: "contains",
            },
          ],
        },
        expected: 0,
      },
      {
        title: "Filter TEXT_MATCH with an optional key",
        filters: {
          filters: [
            {
              key: "non-existing-key",
              value: "a",
              operator: "text_match",
            },
          ],
        },
        expected: 0,
      },
    ];

    testcases.forEach((tc) => {
      it(`[${tc.title}] should return ${tc.expected} nodes`, async () => {
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
