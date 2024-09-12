/* eslint-disable turbo/no-undeclared-env-vars */
import { ExtismToolFactory } from "@llamaindex/extism-tools/ExtismToolFactory";
import { OpenAI, OpenAIAgent, Settings } from "llamaindex";

async function main() {
  const WikiTool = await ExtismToolFactory.createToolClass("wiki");
  const wikiTool = new WikiTool();
  Settings.llm = new OpenAI();
  const agent = new OpenAIAgent({ tools: [wikiTool] });
  const result = await agent.chat({ message: "Ho Chi Minh City" });
  console.log(result.message);
}

void main();
