"use server";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { OpenAI, OpenAIAgent } from "@llamaindex/openai";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { Settings, VectorStoreIndex } from "llamaindex";

Settings.llm = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY ?? "FAKE_KEY_TO_PASS_TESTS",
  model: "gpt-4o",
});
Settings.embedModel = new HuggingFaceEmbedding({
  modelType: "BAAI/bge-small-en-v1.5",
});
Settings.callbackManager.on("llm-tool-call", (event) => {
  console.log(event.detail);
});
Settings.callbackManager.on("llm-tool-result", (event) => {
  console.log(event.detail);
});

export async function getOpenAIModelRequest(query: string) {
  try {
    const currentDir = __dirname;

    // load our data and create a query engine
    const reader = new SimpleDirectoryReader();
    const documents = await reader.loadData(currentDir);
    const index = await VectorStoreIndex.fromDocuments(documents);

    // define the query engine as a tool
    const tools = [
      index.queryTool({
        options: {
          similarityTopK: 10,
        },
        metadata: {
          name: "deployment_details_per_env",
          description: `This tool can answer detailed questions about deployments happened in various environments.`,
        },
      }),
    ];

    // create the agent
    const agent = new OpenAIAgent({ tools });

    const { response } = await agent.chat({
      message: query,
    });
    return {
      message: response,
    };
  } catch (err) {
    console.error(err);
    return {
      errors: "Error Calling OpenAI Model",
    };
  }
}
