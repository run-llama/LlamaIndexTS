import { OpenAI } from "@llamaindex/openai";
import { AgentStream, agent, tool } from "llamaindex";
import { z } from "zod";
import { WikipediaTool } from "../wiki";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo" });
  const wikiTool = new WikipediaTool();

  const workflow = agent({
    tools: [wikiTool],
    llm,
    verbose: false,
  });

  // Chat with the agent
  const context = workflow.run("Who was Goethe?");

  for await (const event of context) {
    if (event instanceof AgentStream) {
      process.stdout.write(event.data.delta);
    }
  }
}

(async function () {
  await main();
  console.log("\nDone");
})();

const addTool = tool({
  name: "add",
  description: "Adds two numbers",
  parameters: z.object({ x: z.number(), y: z.number() }),
  execute: ({ x, y }) => x + y,
});
