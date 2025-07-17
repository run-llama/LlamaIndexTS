import { openai } from "@llamaindex/openai";
import { tool, ToolCall } from "llamaindex";
import z from "zod";

import { ChatMessage } from "llamaindex";

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
      stream: true,
    });
    if (result.stream) {
      let content = "";
      for await (const chunk of result.stream) {
        process.stdout.write(chunk.delta);
        content += chunk.delta;
      }
      // TODO: result.messages must contain the message if the stream is done
      messages.push({
        role: "assistant",
        content,
      });
    } else if (result.messages && result.toolCalls) {
      messages.push(...result.messages);
    }
    toolCalls = result.toolCalls;
  } while (toolCalls.length > 0);
}

(async function () {
  await main();
})();
