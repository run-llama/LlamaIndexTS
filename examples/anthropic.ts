import { Anthropic } from "llamaindex";

(async () => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-sonnet-20240229",
  });
  const result = await anthropic.chat({
    stream: true,
    messages: [
      { content: "You want to talk in rhymes.", role: "system" },
      {
        content:
          "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        role: "user",
      },
    ],
  });
  for await (const message of result) {
    process.stdout.write(`${message.delta}`);
  }
  console.log();
})();
