"use server";
import { Document, VectorStoreIndex, type QueryEngine } from "llamaindex";
import { readFile } from "node:fs/promises";
let _queryEngine: QueryEngine;

async function lazyLoadQueryEngine() {
  if (!_queryEngine) {
    const path = "node_modules/llamaindex/examples/abramov.txt";

    const essay = await readFile(path, "utf-8");

    // Create Document object with essay
    const document = new Document({ text: essay, id_: path });

    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments([document]);

    _queryEngine = index.asQueryEngine();
  }
  return _queryEngine;
}

export async function chatWithAI(question: string): Promise<string> {
  const queryEngine = await lazyLoadQueryEngine();
  const { response } = await queryEngine.query({ query: question });
  return response;
}
