import {
  ContextChatEngine,
  LLM,
  SimpleDocumentStore,
  VectorStoreIndex,
  genericFileSystem,
  serviceContextFromDefaults,
  storageContextFromDefaults,
} from "llamaindex";
import { CHUNK_OVERLAP, CHUNK_SIZE, STORAGE_CACHE_DIR } from "./constants.mjs";

async function getDataSource(llm: LLM) {
  const fs = genericFileSystem;
  await fs.writeFile(
    `${STORAGE_CACHE_DIR}/doc_store.json`,
    JSON.stringify(await import("../../../../cache/doc_store.json")),
  );
  await fs.writeFile(
    `${STORAGE_CACHE_DIR}/index_store.json`,
    JSON.stringify(await import("../../../../cache/index_store.json")),
  );
  await fs.writeFile(
    `${STORAGE_CACHE_DIR}/vector_store.json`,
    JSON.stringify(await import("../../../../cache/vector_store.json")),
  );

  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  let storageContext = await storageContextFromDefaults({
    persistDir: `${STORAGE_CACHE_DIR}`,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    throw new Error(
      `StorageContext is empty - call 'npm run generate' to generate the storage first`,
    );
  }
  return await VectorStoreIndex.init({
    storageContext,
    serviceContext,
  });
}

export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
  const retriever = index.asRetriever();
  retriever.similarityTopK = 5;

  return new ContextChatEngine({
    chatModel: llm,
    retriever,
  });
}
