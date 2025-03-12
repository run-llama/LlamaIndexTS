import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { z } from "zod";

(async () => {
  const llm = new OpenAI({ model: "gpt-4.5-preview", temperature: 0.1 });

  // complete api
  const response1 = await llm.complete({ prompt: "How are you?" });
  console.log(response1.text);

  // Define a zod schema for the response format
  const responseFormatSchema = z.object({
    joke: z.string(),
    laughIndex: z.number(),
  });

  // chat api with response format
  const response2 = await llm.chat({
    messages: [
      { content: "Tell me a joke.", role: "user" },
      {
        role: "system",
        content: "You are a joke teller",
      },
    ],
    responseFormat: responseFormatSchema,
  });

  console.log(JSON.parse(response2.message.content.toString()));

  // chat api with response format as JSON mode
  const response3 = await llm.chat({
    messages: [
      { content: "Give me a fun fact.", role: "user" },
      {
        role: "system",
        content: "You are a fun fact provider. Output in json format.",
      },
    ],
    responseFormat: { type: "json_object" },
  });

  console.log(response3.message.content);

  // chat api with no response format
  const response4 = await llm.chat({
    messages: [
      { content: "What's the weather like today?", role: "user" },
      {
        role: "system",
        content: "You are a weather reporter",
      },
    ],
  });

  console.log(response4.message.content);

  //streaming chat api with response format
  const response5 = await llm.chat({
    messages: [
      { content: "Tell me a joke.", role: "user" },
      { role: "system", content: "You are a joke teller" },
    ],
    responseFormat: responseFormatSchema,
    stream: true,
  });
  for await (const chunk of response5) {
    process.stdout.write(chunk.delta);
  }
  // embeddings
  const embedModel = new OpenAIEmbedding();
  const texts = ["hello", "world"];
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
})();
