import dotenv from "dotenv";
import {
  SimpleDirectoryReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";

dotenv.config();

// Get direct connection string from Supabase and set it as POSTGRES_URL environment variable
// https://supabase.com/docs/guides/database/connecting-to-postgres#direct-connection

const sourceDir = "../data";
const connectionString = process.env.POSTGRES_URL;

const rdr = new SimpleDirectoryReader();
const docs = await rdr.loadData({ directoryPath: sourceDir });
const pgvs = new PGVectorStore({ clientConfig: { connectionString } });
pgvs.setCollection(sourceDir);

const ctx = await storageContextFromDefaults({ vectorStore: pgvs });

const index = await VectorStoreIndex.fromDocuments(docs, {
  storageContext: ctx,
});

const queryEngine = index.asQueryEngine();

const results = await queryEngine.query({
  query: "Information about the planet",
});

console.log(results);
