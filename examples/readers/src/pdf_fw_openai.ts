import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { PDFReader } from "@llamaindex/readers/pdf";
import { VectorStoreIndex } from "llamaindex";

import { Settings } from "llamaindex";

// Update llm and embedModel

Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });
Settings.embedModel = new OpenAIEmbedding({
  model: "nomic-ai/nomic-embed-text-v1.5",
});

async function main() {
  // Load PDF
  const reader = new PDFReader();
  const documents = await reader.loadData("../data/brk-2022.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query: "What mistakes did Warren E. Buffett make?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
