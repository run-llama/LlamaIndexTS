import { OpenAI, Settings } from "llamaindex";

(async () => {
  console.log({ Settings });

  Settings.llm = new OpenAI({ model: "gpt-4-1106-preview", temperature: 0.1 });

  console.log({ llm: Settings.llm });
})();
