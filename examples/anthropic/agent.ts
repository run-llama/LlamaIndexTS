import { Anthropic, AnthropicAgent } from "@llamaindex/anthropic";
import { FunctionTool, Settings } from "llamaindex";
import { z } from "zod";
import { WikipediaTool } from "../wiki";

Settings.callbackManager.on("llm-tool-call", (event) => {
  console.log("llm-tool-call", event.detail.toolCall);
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-3-7-sonnet",
});

const agent = new AnthropicAgent({
  llm: anthropic,
  tools: [
    FunctionTool.from(
      (query) => {
        return `The weather in ${query.location} is sunny`;
      },
      {
        name: "weather",
        description: "Get the weather",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
      },
    ),
    new WikipediaTool(),
  ],
});

async function main() {
  const { message } = await agent.chat({
    message:
      "What is the weather in New York? What's the history of New York from Wikipedia in 3 sentences?",
  });

  console.log(message.content);
}

void main();
