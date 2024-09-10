import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";
import pg from "pg";
import { registerTypes } from "pgvector/pg";
import { describe, expect, test } from "vitest";

describe("pg init", () => {
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

  test("init without", async () => {
    const vectorStore = new PGVectorStore({
      database: "llamaindex_node_test",
    });
    expect(await vectorStore.client()).toBeDefined();
  });
});
