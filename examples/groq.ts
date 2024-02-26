import fs from "node:fs/promises";

import {
  Document,
  Groq,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Create an instance of the LLM
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // Create a service context
  const serviceContext = serviceContextFromDefaults({ llm: groq });

  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // get retriever
  const retriever = index.asRetriever();

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const query = "What is the meaning of life?";

  // Query
  const response = await queryEngine.query({
    query,
  });

  // Log the response
  console.log(response.response);
}

await main();
