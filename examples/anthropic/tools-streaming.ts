import { Anthropic, AnthropicAgent } from "@llamaindex/anthropic";
import { FunctionTool, Settings } from "llamaindex";

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
    FunctionTool.from<{ location: string }>(
      (query) => {
        return `The weather in ${query.location} is sunny`;
      },
      {
        name: "weather",
        description: "Get the weather",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The location to get the weather for",
            },
          },
          required: ["location"],
        },
      },
    ),
  ],
});

async function main() {
  const result = await agent.chat({
    message: "What is the weather in New York?",
    stream: true,
  });

  for await (const chunk of result) {
    process.stdout.write(chunk.delta);
  }
}

void main();
