import { MistralAI } from "llamaindex";

(async () => {
  const llm = new MistralAI({ model: "mistral-tiny" });

  // chat api (non-streaming)
  const response = await llm.chat([
    { content: "What is the best French cheese?", role: "user" },
  ]);
  console.log(response.message.content);

  // chat api (streaming)
  const stream = await llm.chat(
    [{ content: "Who is the most renowned French painter?", role: "user" }],
    undefined,
    true,
  );
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
})();
