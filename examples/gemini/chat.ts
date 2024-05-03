import { Gemini, GEMINI_MODEL } from "llamaindex";

(async () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO,
  });
  const result = await gemini.chat({
    messages: [
      { content: "You want to talk in rhymes.", role: "system" },
      {
        content:
          "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        role: "user",
      },
    ],
  });
  console.log(result);
})();
