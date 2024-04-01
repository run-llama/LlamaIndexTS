import { LlamaParseReader, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load PDF using LlamaParse
  const reader = new LlamaParseReader({ resultType: "markdown" });
  const documents = await reader.loadData("../data/TOS.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What is the license grant in the TOS?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
