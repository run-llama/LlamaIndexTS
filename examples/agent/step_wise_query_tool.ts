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
  });

  const task = agent.createTask("What was his salary?");

  let count = 0;

  while (true) {
    const stepOutput = await agent.runStep(task.taskId);

    console.log(`Runnning step ${count++}`);
    console.log(`======== OUTPUT ==========`);
    if (stepOutput.output.response) {
      console.log(stepOutput.output.response);
    } else {
      console.log(stepOutput.output.sources);
    }
    console.log(`==========================`);

    if (stepOutput.isLast) {
      const finalResponse = await agent.finalizeResponse(
        task.taskId,
        stepOutput,
      );
      console.log({ finalResponse });
      break;
    }
  }
}

void main().then(() => {
  console.log("Done");
});
