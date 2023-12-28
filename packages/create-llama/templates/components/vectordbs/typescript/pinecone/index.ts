/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ContextChatEngine,
  LLM,
  serviceContextFromDefaults,
  PineconeVectorStore,
  VectorStoreIndex,
} from "llamaindex";
import { checkRequiredEnvVars, CHUNK_OVERLAP, CHUNK_SIZE } from "./shared.mjs";

async function getDataSource(llm: LLM) {
  checkRequiredEnvVars();
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const store = new PineconeVectorStore();
  return await VectorStoreIndex.fromVectorStore(store, serviceContext);
}

export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
  const retriever = index.asRetriever({ similarityTopK: 5 });
  return new ContextChatEngine({
    chatModel: llm,
    retriever,
  });
}
