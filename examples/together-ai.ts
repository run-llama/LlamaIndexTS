import { TogetherEmbedding, TogetherLLM } from "llamaindex";

// process.env.TOGETHER_API_KEY is required
const together = new TogetherLLM({
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
});

(async () => {
  const generator = await together.chat({
    messages: [
      {
        role: "system",
        content: "You are an AI assistant",
      },
      {
        role: "user",
        content: "Tell me about San Francisco",
      },
    ],
    stream: true,
  });
  console.log("Chatting with Together AI...");
  for await (const message of generator) {
    process.stdout.write(message.delta);
  }
  const embedding = new TogetherEmbedding();
  const vector = await embedding.getTextEmbedding("Hello world!");
  console.log("vector:", vector);
})();
