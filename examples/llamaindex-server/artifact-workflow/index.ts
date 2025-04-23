import { OpenAI } from "@llamaindex/openai";
import { LlamaIndexServer } from "@llamaindex/server";
import { artifactGenerator } from "@llamaindex/tools";
import "dotenv/config";
import { agent } from "llamaindex";

const workflowFactory = (reqBody: unknown) => {
  return agent({
    tools: [artifactGenerator()],
    llm: new OpenAI({ model: "gpt-4o-mini" }),
  });
};

new LlamaIndexServer({
  workflow: workflowFactory,
  uiConfig: {
    appTitle: "Artifact Generator",
    starterQuestions: [
      "Generate a simple calculator in nextjs",
      "Write binary search algorithm in python",
      "Create a markdown document about the benefits of using nextjs",
      "Write an essay about LLMs",
    ],
  },
  port: 4000,
}).start();
