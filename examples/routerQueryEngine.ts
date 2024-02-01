import {
  OpenAI,
  RouterQueryEngine,
  SimpleDirectoryReader,
  SimpleNodeParser,
  SummaryIndex,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Load documents from a directory
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "node_modules/llamaindex/examples",
  });

  // Parse the documents into nodes
  const nodeParser = new SimpleNodeParser({
    chunkSize: 1024,
  });

  // Create a service context
  const serviceContext = serviceContextFromDefaults({
    nodeParser,
    llm: new OpenAI(),
  });

  // Create indices
  const vectorIndex = await VectorStoreIndex.fromDocuments(documents, {
    serviceContext,
  });

  const summaryIndex = await SummaryIndex.fromDocuments(documents, {
    serviceContext,
  });

  // Create query engines
  const vectorQueryEngine = vectorIndex.asQueryEngine();
  const summaryQueryEngine = summaryIndex.asQueryEngine();

  // Create a router query engine
  const queryEngine = RouterQueryEngine.fromDefaults({
    queryEngineTools: [
      {
        queryEngine: vectorQueryEngine,
        description: "Useful for summarization questions related to Abramov",
      },
      {
        queryEngine: summaryQueryEngine,
        description: "Useful for retrieving specific context from Abramov",
      },
    ],
    serviceContext,
  });

  // Query the router query engine
  const summaryResponse = await queryEngine.query({
    query: "Give me a summary about his past experiences?",
  });

  console.log({
    answer: summaryResponse.response,
    metadata: summaryResponse?.metadata?.selectorResult,
  });

  const specificResponse = await queryEngine.query({
    query: "Tell me about abramov first job?",
  });

  console.log({
    answer: specificResponse.response,
    metadata: specificResponse.metadata.selectorResult,
  });
}

main().then(() => console.log("Done"));
