import { Settings, SimpleDirectoryReader, VectorStoreIndex } from "./index.js";

// Update llm and prompt
Settings.prompt.llm = "claude";

// Update lang
Settings.prompt.lang = "en";

async function main() {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "../examples",
  });

  const index = await VectorStoreIndex.fromDocuments(documents);

  const retriever = await index.asRetriever({});

  retriever.similarityTopK = 10;

  const queryEngine = index.asQueryEngine({
    retriever,
  });

  // Query the engine
  const query = "Tell me about abramov";

  const response = await queryEngine.query({
    query,
  });

  console.log({
    response,
  });
}

main();
