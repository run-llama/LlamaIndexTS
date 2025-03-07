import { DeepSeekLLM } from "@llamaindex/deepseek";

// process.env.DEEPSEEK_API_KEY is required
const deepseek = new DeepSeekLLM({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-coder", // or "deepseek-chat"
});

(async () => {
  // Example of non-streaming chat
  const response = await deepseek.chat({
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
    stream: false,
  });
  console.log("Response from DeepSeek AI:");
  console.log(response);

  // Example of streaming chat
  const generator = await deepseek.chat({
    messages: [
      {
        role: "system",
        content: "You are an AI assistant",
      },
      {
        role: "user",
        content: "Write a short poem about San Francisco",
      },
    ],
    stream: true,
  });
  console.log("\nStreaming response from DeepSeek AI...");
  for await (const message of generator) {
    process.stdout.write(message.delta);
  }
  console.log("\n");
})();
