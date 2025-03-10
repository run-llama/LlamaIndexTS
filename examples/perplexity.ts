import { Perplexity } from "@llamaindex/perplexity";

(async () => {
  const perplexityLLM = new Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY!,
    model: "sonar",
  });

  // Chat API example
  const response = await perplexityLLM.chat({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that provides accurate and concise answers",
      },
      {
        role: "user",
        content: "What is the capital of France?",
      },
    ],
  });
  console.log("Chat response:", response.message.content);

  // Streaming example
  const stream = await perplexityLLM.chat({
    messages: [
      {
        role: "system",
        content: "You are a creative AI assistant that tells engaging stories",
      },
      {
        role: "user",
        content: "Tell me a short story",
      },
    ],
    stream: true,
  });

  console.log("\nStreaming response:");
  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }
})();
