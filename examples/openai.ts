import { OpenAIEmbedding, globalsHelper } from "llamaindex";

(async () => {
  // embeddings
  const embedModel = new OpenAIEmbedding({ model: "text-embedding-3-small" });
  console.log(embedModel.embedInfo);
  const texts = ["hello".repeat(9000), "world"];
  const tokenizer = globalsHelper.tokenizer(embedModel.embedInfo.tokenizer);
  // This call is way too slow! Takes >1m - use something different than js-tiktoken?
  console.log(tokenizer(texts[0]).length);
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
})();
