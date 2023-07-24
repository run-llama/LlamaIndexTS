import fs from "fs/promises";
import { Document, PDFReader, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load PDF
  const reader = new PDFReader();
  const documents = await reader.loadData("examples/brk-2022.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("What mistakes did they make?");

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
