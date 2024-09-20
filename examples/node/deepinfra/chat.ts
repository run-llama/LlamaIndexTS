import { DeepInfra } from "llamaindex";

(async () => {
  if (!process.env.DEEPINFRA_API_TOKEN) {
    throw new Error("Please set the DEEPINFRA_API_TOKEN environment variable.");
  }
  const deepinfra = new DeepInfra({});
  const result = await deepinfra.chat({
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
