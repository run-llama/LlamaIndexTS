import { LlamaDeuce } from "llamaindex";

(async () => {
  const deuce = new LlamaDeuce();
  const result = await deuce.chat([{ content: "Hello, world!", role: "user" }]);
  console.log(result);
})();
