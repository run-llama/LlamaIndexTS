import { VectorStoreIndex } from "llamaindex";
import { HTMLReader } from "llamaindex/readers/HTMLReader";

async function main() {
  // Load page
  const reader = new HTMLReader();
  const documents = await reader.loadData("data/18-1_Changelog.html");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What were the notable changes in 18.1?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
