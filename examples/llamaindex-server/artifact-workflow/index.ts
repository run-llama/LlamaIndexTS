import { OpenAI } from "@llamaindex/openai";
import { LlamaIndexServer } from "@llamaindex/server";
import { codeGenerator } from "@llamaindex/tools";
import "dotenv/config";
import { agent } from "llamaindex";

const codeGeneratorAgent = agent({
  tools: [codeGenerator()],
  llm: new OpenAI({ model: "gpt-4o-mini" }),
});

new LlamaIndexServer({
  workflow: () => codeGeneratorAgent,
  uiConfig: {
    appTitle: "Code Generator",
    starterQuestions: ["Generate a simple calculator"],
  },
  port: 4000,
}).start();
