import { PDFReader, VectorStoreIndex } from "llamaindex";
import { resolve } from "node:path";

async function main() {
  // Load PDF
  const reader = new PDFReader();
  const documents = await reader.loadData(
    resolve(__dirname, "../data/brk-2022.pdf"),
  );

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
