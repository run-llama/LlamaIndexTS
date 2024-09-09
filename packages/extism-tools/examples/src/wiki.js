import { ExtismToolFactory } from "@llamaindex/extism-tools/ExtismToolFactory";
import { OpenAIAgent } from "llamaindex";

async function main() {
  const WikiTool = await ExtismToolFactory.createToolClass("wiki");
  const wikiTool = new WikiTool();
  const agent = new OpenAIAgent({ tools: [wikiTool] });
  const result = await agent.chat({ message: "Ho Chi Minh City" });
  console.log(result.message);
}

void main();
