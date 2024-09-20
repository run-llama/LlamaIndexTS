/* eslint-disable turbo/no-undeclared-env-vars */
import { config } from "dotenv";
import { Document, VectorStoreQueryMode } from "llamaindex";
import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";
import assert from "node:assert";
import { test } from "node:test";
import pg from "pg";

config({ path: [".env.local", ".env", ".env.ci"] });

const pgConfig = {
  user: process.env.POSTGRES_USER ?? "user",
  password: process.env.POSTGRES_PASSWORD ?? "password",
  database: "llamaindex_node_test",
};

await test("init with client", async (t) => {
  const pgClient = new pg.Client(pgConfig);
  t.after(async () => {
    await pgClient.end();
  });
  const vectorStore = new PGVectorStore({
    client: pgClient,
  });
  assert.deepStrictEqual(await vectorStore.client(), pgClient);
});

await test("init with pool", async (t) => {
  const pgClient = new pg.Pool(pgConfig);
  t.after(async () => {
    await pgClient.end();
  });
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  const client = await pgClient.connect();
  const vectorStore = new PGVectorStore({
    shouldConnect: false,
    client,
  });
  assert.deepStrictEqual(await vectorStore.client(), client);
  client.release(true);
});

await test("init without client", async (t) => {
  const vectorStore = new PGVectorStore({ clientConfig: pgConfig });
  const pgClient = (await vectorStore.client()) as pg.Client;
  t.after(async () => {
    await pgClient.end();
  });
  assert.notDeepStrictEqual(pgClient, undefined);
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

  const pgClient = (await vectorStore.client()) as pg.Client;
  t.after(async () => {
    await pgClient.end();
  });
});
