/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ContextChatEngine,
  LLM,
  PGVectorStore,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import pg from "pg";
import { CHUNK_OVERLAP, CHUNK_SIZE, checkRequiredEnvVars } from "./shared.mjs";

async function getDataSource(llm: LLM) {
  checkRequiredEnvVars();
  const pgvs = new PGVectorStore();
  pgvs.db = new pg.Client({
    connectionString: process.env.PG_CONNECTION_STRING,
  });
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  return await VectorStoreIndex.fromVectorStore(pgvs, serviceContext);
}

export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
  const retriever = index.asRetriever({ similarityTopK: 5 });
  return new ContextChatEngine({
    chatModel: llm,
    retriever,
  });
}
