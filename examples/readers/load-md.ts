import { MarkdownReader, VectorStoreIndex } from "llamaindex";

const FILE_PATH = "./data/planets.md";
const SAMPLE_QUERY = "List all planets";

async function main() {
  // Load markdown file
  console.log("Loading data...");
  const reader = new MarkdownReader();
  const documents = await reader.loadData(FILE_PATH);

  // Create embeddings
  console.log("Creating embeddings...");
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Test query
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({ query: SAMPLE_QUERY });
  console.log(`Test query > ${SAMPLE_QUERY}:\n`, response.toString());
}

main();
