import { createClient } from "@libsql/client";
import {
  BaseEmbedding,
  LibSQLVectorStore,
  type MetadataFilters,
  TextNode,
  VectorStoreQueryMode,
} from "llamaindex";
import { beforeEach, describe, expect, it } from "vitest";

type FilterTestCase = {
  title: string;
  filters?: MetadataFilters;
  expected: number;
};

describe("LibSQLVectorStore", () => {
  let store: LibSQLVectorStore;
  let nodes: TextNode[];

  beforeEach(async () => {
    const client = createClient({ url: ":memory:" });

    await client.execute(`
      CREATE TABLE IF NOT EXISTS test_vectors (
        id TEXT PRIMARY KEY,
        content TEXT,
        metadata TEXT,
        embedding F32_BLOB(2)
      );
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_test_vectors_embedding
      ON test_vectors(libsql_vector_idx(embedding));
    `);

    store = new LibSQLVectorStore({
      db: client,
      tableName: "test_vectors",
      columnName: "embedding",
      dimensions: 2,
      embeddingModel: {} as BaseEmbedding, // Mock
    });

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

    await store.client().execute("DELETE FROM test_vectors");
  });

  describe("manage nodes", () => {
    it("adds nodes to store", async () => {
      const ids = await store.add(nodes);
      expect(ids).length(3);

      const result = await store
        .client()
        .execute("SELECT COUNT(*) as count FROM test_vectors");
      expect(result.rows[0]?.count ?? 0).toBe(3);
    });

    it("deletes a node from store", async () => {
      await store.add(nodes);
      await store.delete("1");

      const result = await store
        .client()
        .execute("SELECT COUNT(*) as count FROM test_vectors");
      expect(result.rows[0]?.count ?? 0).toBe(2);
    });

    it("deletes multiple nodes from store", async () => {
      await store.add(nodes);
      await store.deleteMany(["1", "2"]);

      const result = await store
        .client()
        .execute("SELECT COUNT(*) as count FROM test_vectors");
      expect(result.rows[0]?.count ?? 0).toBe(1);
    });
  });

  describe("query nodes", () => {
    const testcases: FilterTestCase[] = [
      {
        title: "No filter",
        expected: 3,
      },
      {
        title: "Filter with non-existent key",
        filters: {
          filters: [
            {
              key: "non-exist-key",
              value: "cat",
              operator: "==",
            },
          ],
        },
        expected: 0,
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
        title: "Filter contains",
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
        title: "Filter OR condition",
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "==",
            },
            {
              key: "dogId",
              value: "1",
              operator: "==",
            },
          ],
          condition: "or",
        },
        expected: 3,
      },
      {
        title: "Filter AND condition",
        filters: {
          filters: [
            {
              key: "private",
              value: "false",
              operator: "==",
            },
            {
              key: "dogId",
              value: "3",
              operator: "==",
            },
          ],
          condition: "and",
        },
        expected: 1,
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

    it("returns correct similarity scores", async () => {
      await store.add(nodes);
      const result = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 3,
        mode: VectorStoreQueryMode.DEFAULT,
      });

      expect(result.similarities).length(3);
      // Cosine similarity should be close to 1 for identical vectors
      result.similarities.forEach((score) => {
        expect(score).toBeCloseTo(1, 4);
      });
    });

    it("respects similarityTopK limit", async () => {
      await store.add(nodes);
      const result = await store.query({
        queryEmbedding: [0.1, 0.2],
        similarityTopK: 2,
        mode: VectorStoreQueryMode.DEFAULT,
      });

      expect(result.nodes).length(2);
      expect(result.similarities).length(2);
      expect(result.ids).length(2);
    });

    it("throws error for wrong embedding dimensions", async () => {
      await store.add(nodes);
      await expect(
        store.query({
          queryEmbedding: [0.1, 0.2, 0.3], // 3D vector when store expects 2D
          similarityTopK: 3,
          mode: VectorStoreQueryMode.DEFAULT,
        }),
      ).rejects.toThrow("Query embedding must have dimension 2");
    });
  });
});
