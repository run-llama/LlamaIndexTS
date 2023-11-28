import { EpubReader, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load PDF
  const reader = new EpubReader();
  const documents = await reader.loadData("data/wells.epub");
  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("What is this about?");

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
