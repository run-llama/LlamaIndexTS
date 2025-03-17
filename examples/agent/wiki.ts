import { OpenAI } from "@llamaindex/openai";
import { wiki } from "@llamaindex/tools";
import { AgentStream, agent } from "llamaindex";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo" });

  const workflow = agent({
    tools: [wiki()],
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
