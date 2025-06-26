import { Gemini, GEMINI_MODEL } from "@llamaindex/google";

(async () => {
  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_2_0_FLASH,
    vertexai: true,
    project: "your-cloud-project", // update to your cloud project
    location: "us-central1",
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
