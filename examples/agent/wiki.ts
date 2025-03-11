import { OpenAI } from "@llamaindex/openai";
import { AgentStream, agent } from "llamaindex";
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
      for (const chunk of event.data.delta) {
        process.stdout.write(chunk);
      }
    } else {
      console.log(event);
    }
  }
}

(async function () {
  await main();
  console.log("\nDone");
})();
