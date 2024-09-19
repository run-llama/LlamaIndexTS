import { HuggingFaceInferenceAPI } from "llamaindex";

(async () => {
  if (!process.env.HUGGING_FACE_TOKEN) {
    throw new Error("Please set the HUGGING_FACE_TOKEN environment variable.");
  }
  const hf = new HuggingFaceInferenceAPI({
    accessToken: process.env.HUGGING_FACE_TOKEN,
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  });
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
