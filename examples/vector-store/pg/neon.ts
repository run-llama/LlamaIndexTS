import dotenv from "dotenv";
import { Document, PGVectorStore, VectorStoreQueryMode } from "llamaindex";
import postgres from "postgres";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, ENDPOINT_ID } = process.env;
const PGPASSWORD = decodeURIComponent(process.env.PGPASSWORD!);

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

await sql`CREATE EXTENSION IF NOT EXISTS vector`;

const vectorStore = new PGVectorStore({
  dimensions: 3,
  client: sql,
});

await vectorStore.add([
  new Document({
    text: "hello, world",
    embedding: [1, 2, 3],
  }),
]);

const results = await vectorStore.query({
  mode: VectorStoreQueryMode.DEFAULT,
  similarityTopK: 1,
  queryEmbedding: [1, 2, 3],
});

console.log("result", results);

await sql.end();
