import { mistral } from "@llamaindex/mistral";
import { agent, tool } from "llamaindex";
import { z } from "zod";
import { WikipediaTool } from "../wiki";

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
    new WikipediaTool(),
  ],
  llm: mistral({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-small-latest",
  }),
});

async function main() {
  const result = await workflow.run(
    "What is the weather in New York? What's the history of New York from Wikipedia in 3 sentences?",
  );
  console.log(result.data);
}

void main();
