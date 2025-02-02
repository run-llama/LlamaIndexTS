import fs from "node:fs/promises";

import {
  Document,
  Groq,
  HuggingFaceEmbedding,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

// Update llm to use Groq
Settings.llm = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Use HuggingFace for embeddings
Settings.embedModel = new HuggingFaceEmbedding({
  modelType: "Xenova/all-mpnet-base-v2",
});

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

  // get retriever
  const retriever = index.asRetriever();

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const query = "What is the meaning of life?";

  // Query
  const {
    message: { content },
  } = await queryEngine.query({
    query,
  });

  // Log the response
  console.log(content);
}

main().catch(console.error);
