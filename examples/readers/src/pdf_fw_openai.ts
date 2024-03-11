import { OpenAI, OpenAIEmbedding, VectorStoreIndex } from "llamaindex";
import { PDFReader } from "llamaindex/readers/PDFReader";

import { serviceContextFromDefaults } from "llamaindex";

const embedModel = new OpenAIEmbedding({
  model: "nomic-ai/nomic-embed-text-v1.5",
});

const llm = new OpenAI({
  model: "accounts/fireworks/models/mixtral-8x7b-instruct",
});

const serviceContext = serviceContextFromDefaults({ llm, embedModel });

async function main() {
  // Load PDF
  const reader = new PDFReader();
  const documents = await reader.loadData("../data/brk-2022.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents, {
    serviceContext,
  });

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What mistakes did Warren E. Buffett make?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
