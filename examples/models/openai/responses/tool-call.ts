import { openaiResponses } from "@llamaindex/openai";
import { tool } from "llamaindex";

import * as z from "zod/v4";
async function main() {
  const weatherTool = tool({
    name: "weather",
    description: "Get the weather",
    parameters: z.object({
      location: z.string().describe("The location to get the weather for"),
    }),
    execute: ({ location }) => {
      return `The weather in ${location} is sunny`;
    },
  });

  const llm = openaiResponses({
    model: "gpt-4o-mini",
    temperature: 0.1,
  });

  const response = await llm.chat({
    messages: [
      {
        role: "user",
        content: "What is the weather in New York?",
      },
    ],
    tools: [weatherTool],
  });

  console.log(response.message.options);
}

main().catch(console.error);
