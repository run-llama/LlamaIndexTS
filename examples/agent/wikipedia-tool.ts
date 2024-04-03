import { OpenAIAgent, WikipediaTool } from "llamaindex";

async function main() {
  const wikipediaTool = new WikipediaTool();

  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [wikipediaTool],
    verbose: true,
  });

  // Chat with the agent
  const response = await agent.chat({
    message: "Where is Ho Chi Minh City?",
  });

  // Print the response
  console.log(response);
}

void main().then(() => {
  console.log("Done");
});
