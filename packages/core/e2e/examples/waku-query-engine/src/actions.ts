"use server";
import { Document, VectorStoreIndex } from "llamaindex";
import { readFile } from "node:fs/promises";

const path = "node_modules/llamaindex/examples/abramov.txt";

const essay = await readFile(path, "utf-8");

// Create Document object with essay
const document = new Document({ text: essay, id_: path });

// Split text and create embeddings. Store them in a VectorStoreIndex
const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

export async function chatWithAI(question: string): Promise<string> {
  const { response } = await queryEngine.query({ query: question });
  return response;
}
