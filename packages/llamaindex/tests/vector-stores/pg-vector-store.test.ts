import { Document } from "llamaindex";
import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";
import pg from "pg";
import { registerTypes } from "pgvector/pg";
import { describe, expect, test } from "vitest";
import { VectorStoreQueryMode } from "../../src/index.js";

describe("pg - init", () => {
  test("init with client", async () => {
    const client = new pg.Client({
      database: "llamaindex_node_test",
    });
    await client.connect();
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    await registerTypes(client);
    const vectorStore = new PGVectorStore(client);
    expect(await vectorStore.client()).toBe(client);
  });

  test("init with pool", async () => {
    const pool = new pg.Pool({
      database: "llamaindex_node_test",
    });
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
    const client = await pool.connect();
    await registerTypes(client);
    const vectorStore = new PGVectorStore(client);
    expect(await vectorStore.client()).toBe(client);
  });

  test("init without client", async () => {
    const vectorStore = new PGVectorStore({
      database: "llamaindex_node_test",
    });
    expect(await vectorStore.client()).toBeDefined();
  });
});

describe("pg - save data", () => {
  test("simple node", async () => {
    const dimensions = 3;
    const schemaName =
      "llamaindex_vector_store_test_" + Math.random().toString(36).substring(7);
    const nodeId = "5bb16627-f6c0-459c-bb18-71642813ef21";
    const node = new Document({
      text: "hello world",
      id_: nodeId,
      embedding: [0.1, 0.2, 0.3],
    });
    const vectorStore = new PGVectorStore({
      database: "llamaindex_node_test",
      dimensions,
      schemaName,
    });

    await vectorStore.add([node]);

    {
      const result = await vectorStore.query({
        mode: VectorStoreQueryMode.DEFAULT,
        similarityTopK: 1,
        queryEmbedding: [1, 2, 3],
      });
      const actualJSON = result.nodes![0]!.toJSON();
      expect(actualJSON).toEqual({
        ...node.toJSON(),
        hash: actualJSON.hash,
        metadata: actualJSON.metadata,
      });
      expect(result.ids).toEqual([nodeId]);
      expect(result.similarities).toEqual([1]);
    }

    await vectorStore.delete(nodeId);

    {
      const result = await vectorStore.query({
        mode: VectorStoreQueryMode.DEFAULT,
        similarityTopK: 1,
        queryEmbedding: [1, 2, 3],
      });
      expect(result.nodes).toEqual([]);
    }
  });
});
