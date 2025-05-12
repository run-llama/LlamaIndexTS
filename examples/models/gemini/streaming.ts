import { gemini, GEMINI_MODEL } from "@llamaindex/google";

(async () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const llm = gemini({
    model: GEMINI_MODEL.GEMINI_PRO_LATEST,
  });
  const stream = await llm.chat({
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
  console.log("\n\ndone");
})();
