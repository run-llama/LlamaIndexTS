import { Anthropic } from "llamaindex";

(async () => {
  const anthropic = new Anthropic();
  const result = await anthropic.chat({
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
