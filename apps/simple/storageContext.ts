import { Document, VectorStoreIndex, storageContextFromDefaults } from "llamaindex";
import essay from "./essay";


async function main() {
  // Create Document object with essay
  const document = new Document({ text: essay });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  // persist the vector store automatically with the storage context
  const storageContext = await storageContextFromDefaults({ persistDir: "./storage" });
  const index = await VectorStoreIndex.fromDocuments([document], { storageContext });

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "What did the author do in college?"
  );

  // Output response
  console.log(response.toString());

  // load the index
  const loadedIndex = await VectorStoreIndex.init({ storageContext });
  const laodedQueryEngine = loadedIndex.asQueryEngine();
  const loadedResponse = await laodedQueryEngine.query(
    "What did the author do growing up?"
  );
  console.log(loadedResponse.toString());
}

main().catch(console.error);
