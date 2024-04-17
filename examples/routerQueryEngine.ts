import {
  OpenAI,
  RouterQueryEngine,
  Settings,
  SimpleDirectoryReader,
  SimpleNodeParser,
  SummaryIndex,
  VectorStoreIndex,
} from "llamaindex";

// Update llm
Settings.llm = new OpenAI();

// Update node parser
Settings.nodeParser = new SimpleNodeParser({
  chunkSize: 1024,
});

async function main() {
  // Load documents from a directory
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "node_modules/llamaindex/examples",
  });

  // Create indices
  const vectorIndex = await VectorStoreIndex.fromDocuments(documents);

  const summaryIndex = await SummaryIndex.fromDocuments(documents);

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

void main().then(() => console.log("Done"));
