import { ReplicateLLM } from "llamaindex";

(async () => {
  const tres = new ReplicateLLM({ model: "llama-3-70b-instruct" });
  const stream = await tres.chat({
    messages: [{ content: "Hello, world!", role: "user" }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }
  console.log("\n\ndone");
})();
