import { Anthropic } from "@llamaindex/anthropic";
import { ChatMessage, ToolCall } from "llamaindex";
import * as z from "zod/v4";

const llm = new Anthropic({ model: "claude-4-0-sonnet" });

const responseSchema = z.object({
  title: z.string(),
  author: z.string(),
  year: z.number(),
});

async function main() {
  const messages: ChatMessage[] = [];
  let toolCalls: ToolCall[] = [];
  do {
    const result = await llm.exec({
      messages: [
        {
          role: "system",
          content: `You are a book expert. Your task is, given a user message, extract the title, author and publication year of the book and output them in JSON format.`,
        },
        {
          role: "user",
          content: `I have been reading La Divina Commedia by Dante Alighieri, published in 1321, which tells the story of a guy who goes through Hell, Purgatory and Heaven just to meet his beloved ex-girlfriend.`,
        },
      ],
      responseFormat: responseSchema,
    });
    messages.push(...result.newMessages);
    toolCalls = result.toolCalls;
  } while (toolCalls.length == 0);

  console.log(messages[1].content);
  console.log(toolCalls);
}

main().catch(console.error);
