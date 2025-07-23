import { anthropic } from "@llamaindex/anthropic";
import { wiki } from "@llamaindex/tools";
import { agent } from "@llamaindex/workflow";
import { tool } from "llamaindex";
import * as z from "zod/v4";

const workflow = agent({
  tools: [
    tool({
      name: "weather",
      description: "Get the weather",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      execute: ({ location }) => `The weather in ${location} is sunny`,
    }),
    wiki(),
  ],
  llm: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-7-sonnet",
  }),
});

async function main() {
  const result = await workflow.run(
    "What is the weather in New York? What's the history of New York from Wikipedia in 3 sentences?",
  );
  console.log(result.data);
}

void main();
