import { VectorStoreIndex } from "llamaindex";
import { DocxReader } from "llamaindex/readers/DocxReader";

const FILE_PATH = "../data/stars.docx";
const SAMPLE_QUERY = "Information about Zodiac";

async function main() {
  // Load docx file
  console.log("Loading data...");
  const reader = new DocxReader();
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
