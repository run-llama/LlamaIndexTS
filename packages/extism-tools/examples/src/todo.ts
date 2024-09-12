import { ExtismToolFactory } from "@llamaindex/extism-tools";
import { OpenAI, OpenAIAgent, Settings } from "llamaindex";

async function main() {
  const TodoTool = await ExtismToolFactory.createToolClass("todo");
  const todoTool = new TodoTool();
  Settings.llm = new OpenAI();
  const agent = new OpenAIAgent({ tools: [todoTool] });
  const result = await agent.chat({ message: "Get first todo" });
  console.log(result.message);
}

void main();
