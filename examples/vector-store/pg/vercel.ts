// https://vercel.com/docs/storage/vercel-postgres/sdk
import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
import { Document, VectorStoreQueryMode } from "llamaindex";
import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";

dotenv.config();

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
