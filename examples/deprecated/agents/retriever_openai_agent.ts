import { OpenAIAgent } from "@llamaindex/openai";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import {
  FunctionTool,
  MetadataMode,
  NodeWithScore,
  VectorStoreIndex,
} from "llamaindex";
import * as z from "zod/v4";

async function main() {
  // Load the documents
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "node_modules/llamaindex/examples",
  });

  // Create a vector index from the documents
  const vectorIndex = await VectorStoreIndex.fromDocuments(documents);

  const retriever = vectorIndex.asRetriever({ similarityTopK: 3 });

  const retrieverTool = FunctionTool.from(
    async ({ query }: { query: string }) => {
      const nodesWithScores = await retriever.retrieve({
        query,
      });
      return nodesWithScores
        .map((nodeWithScore: NodeWithScore) =>
          nodeWithScore.node.getContent(MetadataMode.NONE),
        )
        .join("\n");
    },
    {
      name: "get_abramov_info",
      description: "Get information about the Abramov documents",
      parameters: z.object({
        query: z.string().describe("The query about Abramov"),
      }),
    },
  );

  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [retrieverTool],
    verbose: true,
  });

  // Chat with the agent
  const { message } = await agent.chat({
    message: "What was his first salary?",
  });

  // Print the response
  console.log(message.content);
}

void main().then(() => {
  console.log("Done");
});
