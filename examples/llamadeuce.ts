import { DeuceChatStrategy, LlamaDeuce } from "@llamaindex/replicate";

(async () => {
  const deuce = new LlamaDeuce({ chatStrategy: DeuceChatStrategy.META });
  const result = await deuce.chat({
    messages: [{ content: "Hello, world!", role: "user" }],
  });
  console.log(result);
})();
