import { OpenAI } from "@llamaindex/openai";
import { LlamaIndexServer } from "@llamaindex/server";
import { codeGenerator } from "@llamaindex/tools";
import "dotenv/config";
import { agent } from "llamaindex";

const workflowFactory = (reqBody: unknown) => {
  // TODO: parse reqBody to get current artifact version and history

  return agent({
    tools: [codeGenerator()],
    llm: new OpenAI({ model: "gpt-4o-mini" }),
  });
};

new LlamaIndexServer({
  workflow: workflowFactory,
  uiConfig: {
    appTitle: "Code Generator",
    starterQuestions: [
      "Generate a simple calculator in nextjs",
      "Generate a todo list nextjs",
    ],
  },
  port: 4000,
}).start();
