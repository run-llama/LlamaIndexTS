import { OpenAI, OpenAIEmbedding } from "llamaindex";

(async () => {
  const llm = new OpenAI({ model: "gpt-4-1106-preview", temperature: 0.1 });

  // complete api
  const response1 = await llm.complete({ prompt: "How are you?" });
  console.log(response1.text);

  // chat api
  const response2 = await llm.chat({
    messages: [{ content: "Tell me a joke.", role: "user" }],
  });
  console.log(response2.message.content);

  // embeddings
  const embedModel = new OpenAIEmbedding();
  const texts = ["hello", "world"];
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
})();
