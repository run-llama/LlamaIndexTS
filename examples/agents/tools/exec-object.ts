import { openai } from "@llamaindex/openai";
import { ChatMessage } from "llamaindex";
import z from "zod";

const llm = openai({ model: "gpt-4.1-mini" });

const schema = z.object({
  title: z.string(),
  author: z.string(),
  year: z.number(),
});

const messages: ChatMessage[] = [
  {
    role: "user",
    content: `I have been reading La Divina Commedia by Dante Alighieri, published in 1321`,
  },
];

async function main() {
  {
    // Non-streaming
    const { object } = await llm.exec({ messages, responseFormat: schema });
    console.log("Non-streaming object:", object);
  }

  {
    // Streaming
    let exit = false;
    do {
      const { stream, newMessages, toolCalls, object } = await llm.exec({
        messages,
        stream: true,
        responseFormat: schema,
      });

      for await (const chunk of stream) {
        console.log(chunk.delta);
      }
      console.log("Streaming object:", object);

      messages.push(...newMessages());
      exit = toolCalls.length === 0;
    } while (!exit);
  }
}

main().catch(console.error);
