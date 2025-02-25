import { Anthropic } from "@llamaindex/anthropic";

(async () => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
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
  });
  console.log(result.message);
})();
