import { MarkdownReader, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load Markdown file
  const reader = new MarkdownReader();
  const documents = await reader.loadData("node_modules/llamaindex/README.md");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query("What does the example code do?");

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
