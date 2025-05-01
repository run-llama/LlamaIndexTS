import { OpenAI } from "@llamaindex/openai";
import { wiki } from "@llamaindex/tools";
import { agent, agentStreamEvent } from "@llamaindex/workflow";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo" });

  const workflow = agent({
    tools: [wiki()],
    llm,
    verbose: false,
  });

  // Chat with the agent
  const events = workflow.runStream("Who was Goethe?");

  for await (const event of events) {
    if (agentStreamEvent.include(event)) {
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
