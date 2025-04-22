import { OpenAI } from "@llamaindex/openai";
import { LlamaIndexServer } from "@llamaindex/server";
import { codeGenerator } from "@llamaindex/tools";
import "dotenv/config";
import { agent } from "llamaindex";

const workflowFactory = (reqBody: unknown) => {
  return agent({
    tools: [codeGenerator()],
    llm: new OpenAI({ model: "gpt-4o-mini" }),
    systemPrompt:
      "You are a code generator. You are given a task and you need to generate a code for the task. You don't need to include code in the response",
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
