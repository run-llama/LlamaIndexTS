import { OpenAI, OpenAIAgent, WikipediaTool } from "llamaindex";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo-preview" });
  const wikiTool = new WikipediaTool();

  // Create an OpenAIAgent with the Wikipedia tool
  const agent = new OpenAIAgent({
    llm,
    tools: [wikiTool],
    verbose: true,
  });

  // Chat with the agent
  const response = await agent.chat({
    message: "Who was Goethe?",
    stream: true,
  });

  for await (const chunk of response.response) {
    process.stdout.write(chunk.response);
  }
}

(async function () {
  await main();
  console.log("\nDone");
})();
