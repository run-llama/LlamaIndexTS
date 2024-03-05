import {
  OpenAIAgent,
  QueryEngineTool,
  SimpleDirectoryReader,
  VectorStoreIndex,
} from "llamaindex";

async function main() {
  // Load the documents
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "node_modules/llamaindex/examples",
  });

  // Create a vector index from the documents
  const vectorIndex = await VectorStoreIndex.fromDocuments(documents);

  // Create a query engine from the vector index
  const abramovQueryEngine = vectorIndex.asQueryEngine();

  // Create a QueryEngineTool with the query engine
  const queryEngineTool = new QueryEngineTool({
    queryEngine: abramovQueryEngine,
    metadata: {
      name: "abramov_query_engine",
      description: "A query engine for the Abramov documents",
    },
  });

  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [queryEngineTool],
    verbose: true,
  });

  // Chat with the agent
  const response = await agent.chat({
    message: "What was his salary?",
  });

  // Print the response
  console.log(String(response));
}

main().then(() => {
  console.log("Done");
});
