import { Anthropic } from "@llamaindex/anthropic";

(async () => {
  const anthropic = new Anthropic({
    model: "claude-3-7-sonnet",
    maxTokens: 20000,
    additionalChatOptions: {
      thinking: {
        type: "enabled",
        budget_tokens: 16000,
      },
    },
  });
  const result = await anthropic.chat({
    messages: [
      {
        role: "user",
        content:
          "Are there an infinite number of prime numbers such that n mod 4 == 3?",
      },
    ],
    stream: true,
  });
  console.log("Thinking...");
  for await (const chunk of result) {
    if (chunk.delta) {
      process.stdout.write(chunk.delta);
    } else if (chunk.options?.thinking) {
      process.stdout.write(chunk.options.thinking);
    } else if (chunk.options?.thinking_signature) {
      process.stdout.write(chunk.options.thinking_signature);
    }
  }

  console.log("Again, but without streaming");
  const resultNoStream = await anthropic.chat({
    messages: [
      {
        role: "user",
        content:
          "Are there an infinite number of prime numbers such that n mod 4 == 3?",
      },
    ],
  });

  console.log(resultNoStream.message.options?.thinking);
  console.log(resultNoStream.message.options?.thinking_signature);
  console.log(resultNoStream.message.content);
})();
