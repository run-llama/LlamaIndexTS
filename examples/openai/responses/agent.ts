import { openaiResponses } from "@llamaindex/openai";
import { wiki } from "@llamaindex/tools";
import { agent, tool } from "llamaindex";
import { z } from "zod";

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
  llm: openaiResponses({
    model: "gpt-4o-mini",
  }),
});

async function main() {
  const result = await workflow.run(
    "What is the weather in New York? What's the history of New York from Wikipedia in 3 sentences?",
  );
  console.log(result.data);
}

void main();
