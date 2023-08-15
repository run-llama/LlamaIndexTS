import { DeuceChatStrategy, LlamaDeuce } from "llamaindex";

(async () => {
  const deuce = new LlamaDeuce({ chatStrategy: DeuceChatStrategy.META });
  const result = await deuce.chat([{ content: "Hello, world!", role: "user" }]);
  console.log(result);
})();
