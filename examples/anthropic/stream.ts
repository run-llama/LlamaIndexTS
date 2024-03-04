import { Anthropic } from "llamaindex";

(async () => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-instant-1.2",
  });
  const stream = await anthropic.chat({
    messages: [
      { content: "You want to talk in rhymes.", role: "system" },
      {
        content:
          "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        role: "user",
      },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }
})();
