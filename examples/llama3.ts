import { ReplicateLLM } from "llamaindex";

(async () => {
  const tres = new ReplicateLLM({ model: "llama-3-70b-instruct" });
  const result = await tres.chat({
    messages: [{ content: "Hello, world!", role: "user" }],
  });
  console.log(result);
})();
