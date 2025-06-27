import { gemini, GEMINI_MODEL } from "@llamaindex/google";

(async () => {
  const llm = gemini({
    model: GEMINI_MODEL.GEMINI_2_0_FLASH,
    vertex: {
      project: "your-cloud-project", // update to your cloud project
      location: "us-central1",
    },
  });
  const result = await llm.chat({
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
