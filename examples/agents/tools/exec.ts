import { openai } from "@llamaindex/openai";
import { ChatMessage, tool } from "llamaindex";
import z from "zod";

async function main() {
  const llm = openai({ model: "gpt-4.1-mini" });
  const messages = [
    {
      content: `What's the weather like in San Francisco?`,
      role: "user",
    } as ChatMessage,
  ];

  let exit = false;
  do {
    const { newMessages, toolCalls } = await llm.exec({
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
    console.log(newMessages);
    messages.push(...newMessages);
    // exit condition to stop the agent loop
    // here we can also check for specific tool calls or limit the number of llm.exec calls
    exit = toolCalls.length === 0;
  } while (!exit);
}

(async function () {
  console.log("Starting...");
  await main();
  console.log("Done");
})();
