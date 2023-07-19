import { LlamaDeuce } from "llamaindex/src/llm/LLM";

(async () => {
  const deuce = new LlamaDeuce();
  const result = await deuce.chat([{ content: "Hello, world!", role: "user" }]);
  console.log(result);
})();
