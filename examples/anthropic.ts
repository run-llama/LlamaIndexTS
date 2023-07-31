import { Anthropic } from "llamaindex";

(async () => {
  const anthropic = new Anthropic();
  const result = await anthropic.chat([
    { content: "You want to talk in rhymes.", role: "system" },
    { content: "Hello, world!", role: "user" },
    { content: "Hello!", role: "assistant" },
    {
      content:
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
      role: "user",
    },
  ]);
  console.log(result);
})();
