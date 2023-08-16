import { VectorStoreIndex, PapaCSVReader } from "llamaindex";

async function main() {
  // Load CSV
  const reader = new PapaCSVReader();
  const documents = await reader.loadData("examples/titanic_train.csv");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);
  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "What is the correlation between survival and age?"
  );

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
