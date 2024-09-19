/* eslint-disable turbo/no-undeclared-env-vars */
import { Document, VectorStoreQueryMode } from "llamaindex";
import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";
import assert from "node:assert";
import { test } from "node:test";
import pg from "pg";
import { registerTypes } from "pgvector/pg";

let pgClient: pg.Client | pg.Pool;
test.afterEach(async () => {
  await pgClient.end();
});

const pgConfig = {
  user: process.env.POSTGRES_USER ?? process.env.USER ?? "user",
  password: process.env.POSTGRES_PASSWORD ?? "password",
  database: "llamaindex_node_test",
};

await test("init with client", async () => {
  pgClient = new pg.Client(pgConfig);
  await pgClient.connect();
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  await registerTypes(pgClient);
  const vectorStore = new PGVectorStore(pgClient);
  assert.deepStrictEqual(await vectorStore.client(), pgClient);
});

await test("init with pool", async () => {
  pgClient = new pg.Pool(pgConfig);
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  const client = await pgClient.connect();
  await registerTypes(client);
  const vectorStore = new PGVectorStore(client);
  assert.deepStrictEqual(await vectorStore.client(), client);
  client.release();
});

await test("init without client", async () => {
  const vectorStore = new PGVectorStore(pgConfig);
  pgClient = (await vectorStore.client()) as pg.Client;
  assert.notDeepStrictEqual(pgClient, undefined);
});

await test("simple node", async () => {
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
    ...pgConfig,
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

  pgClient = (await vectorStore.client()) as pg.Client;
});
