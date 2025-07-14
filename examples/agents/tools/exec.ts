import { openai } from "@llamaindex/openai";
import { tool } from "llamaindex";
import z from "zod";

async function main() {
  const llm = openai({ model: "gpt-4.1-mini" });

  const stream = await llm.exec({
    messages: [
      {
        content: "What's the weather like in San Francisco?",
        role: "user",
      },
    ],
    tools: [
      tool({
        name: "get_weather",
        description: "Get the current weather for a location",
        parameters: z.object({
          address: z.string().describe("The address"),
        }),
        execute: ({ address }) => {
          console.log("Executing tool call", address);
          return `It's sunny in ${address}!`;
        },
      }),
    ],
    additionalChatOptions: {
      tool_choice: "required",
    },
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }
}

(async function () {
  console.log("Starting...");
  await main();
  console.log("Done");
})();
