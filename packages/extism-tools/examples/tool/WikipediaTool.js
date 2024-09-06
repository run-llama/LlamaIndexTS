import { OpenAIAgent } from "llamaindex";
import { WikipediaTool } from "../../dist/WikipediaTool.js";

const wikiTool = new WikipediaTool();
void wikiTool.call({ query: "Ho Chi Minh City" }).then(console.log);

async function main() {
  const agent = new OpenAIAgent({
    tools: [wikiTool],
  });
  const result = await agent.chat({
    message: "Ho Chi Minh City",
  });
  console.log(result.message);
}

void main();
