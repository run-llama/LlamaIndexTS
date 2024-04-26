import { GEMINI_MODEL, GeminiEmbedding } from "llamaindex";

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const embedModel = new GeminiEmbedding({
    model: GEMINI_MODEL.GEMINI_PRO,
  });
  const texts = ["hello", "world"];
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
}

main().catch(console.error);
