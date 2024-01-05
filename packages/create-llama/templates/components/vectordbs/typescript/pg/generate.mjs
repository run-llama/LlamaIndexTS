/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";
import {
  PGVectorStore,
  SimpleDirectoryReader,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import {
  PGVECTOR_SCHEMA,
  PGVECTOR_TABLE,
  STORAGE_DIR,
  checkRequiredEnvVars,
} from "./shared.mjs";

dotenv.config();

async function loadAndIndex() {
  // load objects from storage and convert them into LlamaIndex Document objects
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: STORAGE_DIR,
  });

  // create postgres vector store
  const vectorStore = new PGVectorStore({
    connectionString: process.env.PG_CONNECTION_STRING,
    schemaName: PGVECTOR_SCHEMA,
    tableName: PGVECTOR_TABLE,
  });
  vectorStore.setCollection(STORAGE_DIR);
  vectorStore.clearCollection();

  // create index from all the Documents
  console.log("Start creating embeddings...");
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(`Successfully created embeddings.`);
}

(async () => {
  checkRequiredEnvVars();
  await loadAndIndex();
  console.log("Finished generating storage.");
  process.exit(0);
})();
