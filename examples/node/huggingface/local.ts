import { HuggingFaceLLM } from "llamaindex";

(async () => {
  const hf = new HuggingFaceLLM();
  const result = await hf.chat({
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
