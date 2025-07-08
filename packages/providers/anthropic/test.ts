import * as z from "zod/v4";
import { Anthropic } from "./src";

const responseSchema = z.object({
  title: z.string(),
  author: z.string(),
  year: z.number(),
});

const llm = new Anthropic({ model: "claude-4-0-sonnet" });

async function main() {
  const response = await llm.chat({
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
  return response.message.content;
}

const antResponse = await main();
console.log(antResponse);
