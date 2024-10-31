import { config } from "dotenv";
import { Document, VectorStoreQueryMode } from "llamaindex";
import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";
import assert from "node:assert";
import { test } from "node:test";
import pg from "pg";
import { registerTypes } from "pgvector/pg";

config({ path: [".env.local", ".env", ".env.ci"] });

const pgConfig = {
  user: process.env.POSTGRES_USER ?? "user",
  password: process.env.POSTGRES_PASSWORD ?? "password",
  database: "llamaindex_node_test",
};

await test("init with client", async (t) => {
  const pgClient = new pg.Client(pgConfig);
  await pgClient.connect();
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  await registerTypes(pgClient);
  t.after(async () => {
    await pgClient.end();
  });
  const vectorStore = new PGVectorStore({
    client: pgClient,
    shouldConnect: false,
  });
  assert.notDeepStrictEqual(await vectorStore.client(), undefined);
});

await test("init with pool", async (t) => {
  const pgClient = new pg.Pool(pgConfig);
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  const client = await pgClient.connect();
  await client.query("CREATE EXTENSION IF NOT EXISTS vector");
  await registerTypes(client);
  t.after(async () => {
    client.release();
    await pgClient.end();
  });
  const vectorStore = new PGVectorStore({
    shouldConnect: false,
    client,
  });
  assert.notDeepStrictEqual(await vectorStore.client(), undefined);
});

await test("init without client", async (t) => {
  const vectorStore = new PGVectorStore({ clientConfig: pgConfig });
  const db = await vectorStore.client();
  t.after(async () => {
    await db.close();
  });
  assert.notDeepStrictEqual(db, undefined);
});

await test("simple node", async (t) => {
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
    clientConfig: pgConfig,
    dimensions,
    schemaName,
  });
  const db = await vectorStore.client();
  t.after(async () => {
    await db.close();
  });

  await vectorStore.add([node]);

  {
    const result = await vectorStore.query({
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK: 1,
      queryEmbedding: [1, 2, 3],
    });
    const actualJSON = result.nodes![0]!.toJSON();
    assert.deepStrictEqual(actualJSON, {
      ...node.toJSON(),
      hash: actualJSON.hash,
      metadata: actualJSON.metadata,
    });
    assert.deepStrictEqual(result.ids, [nodeId]);
    assert.deepStrictEqual(result.similarities, [1]);
  }

  await vectorStore.delete(nodeId);

  {
    const result = await vectorStore.query({
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK: 1,
      queryEmbedding: [1, 2, 3],
    });
    assert.deepStrictEqual(result.nodes, []);
  }
});

await test("no setup", async (t) => {
  // @ts-expect-error private method
  assert.ok(PGVectorStore.prototype.checkSchema);
  // @ts-expect-error private method
  const Mock = class extends PGVectorStore {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private override async checkSchema(): Promise<any> {
      throw new Error("should not be called");
    }
  };
  const vectorStore = new Mock({
    clientConfig: pgConfig,
    performSetup: false,
  });
  const db = await vectorStore.client();
  t.after(async () => {
    await db.close();
  });
});
