import { OpenAIEmbedding } from "@llamaindex/openai";
import { PGVectorStore } from "@llamaindex/postgres";
import { config } from "dotenv";
import { Document, Settings, VectorStoreQueryMode } from "llamaindex";
import assert from "node:assert";
import { beforeEach, test } from "node:test";
import pg from "pg";
import { registerTypes } from "pgvector/pg";

config({ path: [".env.local", ".env", ".env.ci"] });

/* If you are running this test, you must create a Postgres database
 * named `llamaindex_node_test`, a user named `user` with password `password`, or
 * specify other values in .env.ci. One way to do that:
 * 
 * `$ createdb llamaindex_node_test`
 * `$ psql llamaindex_node_test`
 * `> create user llamaindex_test_user with password 'password';`
 * `> grant all privileges on database llamaindex_node_test to llamaindex_test_user;`
 * 
 * Your .env.ci should then look like this: 
    POSTGRES_USER=llamaindex_test_user
    POSTGRES_PASSWORD=password

 * Note that the created tables for testing are in a schema with a name
 * like `llamaindex_vector_store_test_pa8mk` (with random last five characters).
 */

const pgConfig = {
  user: process.env.POSTGRES_USER ?? "user",
  password: process.env.POSTGRES_PASSWORD ?? "password",
  database: "llamaindex_node_test",
};

beforeEach(async () => {
  Settings.embedModel = new OpenAIEmbedding();
});

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

    /* HACK:
     * metadataDictToNode, which is used by many Vector Store implementations (including PGVectorStore),
     * will only return nodes of type TEXT or INDEX.
     *
     * Strictly, vector stores should return nodes as the same type as they were written -- thus
     * `DOCUMENT` would be the right value for `actualJSON["type"]`. However
     * most vector store implementations do not -- they only return TEXT or INDEX.
     *
     * Eventually, metadataDictToNode should be modified to rehydrate based on the saved type.
     * Until then, this hack works around the problem by accepting `TEXT` (or `DOCUMENT`) for `type`.
     *
     * see https://github.com/run-llama/LlamaIndexTS/pull/2232#issuecomment-3590896516
     * Historically, PGVectorStore did not use metadataDictToNode and it did (unlike other vector
     * stores) return nodes of type `DOCUMENT`. We decided above to make PGVectorStore use the
     * more common, but incorrect, behavior, for the sake of consistency.
     */
    if (actualJSON["type"] == "TEXT") {
      actualJSON["type"] = "TEXT";
    }
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
