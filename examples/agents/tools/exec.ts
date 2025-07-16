import { openai } from "@llamaindex/openai";
import { ChatMessage, tool, ToolCall } from "llamaindex";
import z from "zod";

async function main() {
  const llm = openai({ model: "gpt-4.1-mini" });
  const messages = [
    {
      content: `What's the weather like in San Francisco?`,
      role: "user",
    } as ChatMessage,
  ];

  let toolCalls: ToolCall[] = [];
  do {
    const result = await llm.exec({
      messages,
      tools: [
        tool({
          name: "get_weather",
          description: "Get the current weather for a location",
          parameters: z.object({
            address: z.string().describe("The address"),
          }),
          execute: ({ address }) => {
            return `It's sunny in ${address}!`;
          },
        }),
      ],
    });
    console.log(result.messages);
    messages.push(...result.messages);
    toolCalls = result.toolCalls;
  } while (toolCalls.length > 0);
}

(async function () {
  console.log("Starting...");
  await main();
  console.log("Done");
})();
