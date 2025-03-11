import { anthropic } from "@llamaindex/anthropic";
import { agent, Settings, tool } from "llamaindex";
import { z } from "zod";
import { WikipediaTool } from "../wiki";

Settings.llm = anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-3-7-sonnet",
});

const workflow = agent({
  tools: [
    tool({
      name: "weather",
      description: "Get the weather",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      execute: async ({ location }) => {
        return `The weather in ${location} is sunny`;
      },
    }),
    new WikipediaTool(),
  ],
});

async function main() {
  const workflowContext = workflow.run(
    "What is the weather in New York? What's the history of New York from Wikipedia in 3 sentences?",
  );
  const result = await workflowContext;
  console.log(result.data);
}

void main();
