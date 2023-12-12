import { MistralAI, MistralAIEmbedding } from "llamaindex";

(async () => {
  // embeddings
  const embedding = new MistralAIEmbedding();
  const embeddingsResponse = await embedding.getTextEmbedding(
    "What is the best French cheese?",
  );
  console.log(
    `MistralAI embeddings are ${embeddingsResponse.length} numbers long\n`,
  );

  // chat api (non-streaming)
  const llm = new MistralAI({ model: "mistral-tiny" });
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
