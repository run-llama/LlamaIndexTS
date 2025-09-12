import { Anthropic } from "@llamaindex/anthropic";
import { ChatMessage, ToolCall } from "llamaindex";
import { z } from "zod";

const llm = new Anthropic({ model: "claude-4-0-sonnet" });

const responseSchema = z.object({
  title: z.string().describe("The title of the book"),
  author: z.string().describe("The author of the book"),
  year: z.number().describe("The publication year"),
});

async function main() {
  const messages: ChatMessage[] = [];
  let toolCalls: ToolCall[] = [];
  do {
    //
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
    console.log("result.object: ", result.object);
    messages.push(...result.newMessages);
    toolCalls = result.toolCalls;
  } while (toolCalls.length == 0);

  console.log(toolCalls);
}

main().catch(console.error);
