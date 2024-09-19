import { Gemini, GEMINI_MODEL, GeminiVertexSession } from "llamaindex";

(async () => {
  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO,
    session: new GeminiVertexSession(),
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
