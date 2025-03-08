import { Perplexity } from "@llamaindex/perplexity";

async function main() {
  const llm = new Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY!,
    model: "sonar",
  });

  // Chat API example
  const response = await llm.chat({
    messages: [{ content: "What is the capital of France?", role: "user" }],
  });
  console.log("Chat response:", response.message.content);

  // Streaming example
  const stream = await llm.chat({
    messages: [{ content: "Tell me a short story", role: "user" }],
    stream: true,
  });

  console.log("\nStreaming response:");
  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }
}

main().catch(console.error);
