import { OpenAI, OpenAIAgent, WikipediaTool } from "llamaindex";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo" });
  const wikiTool = new WikipediaTool();

  // Create an OpenAIAgent with the Wikipedia tool
  const agent = new OpenAIAgent({
    llm,
    tools: [wikiTool],
  });

  // Chat with the agent
  const response = await agent.chat({
    message: "Who was Goethe?",
    stream: true,
  });

  for await (const {
    response: { delta },
  } of response) {
    process.stdout.write(delta);
  }
}

(async function () {
  await main();
  console.log("\nDone");
})();
