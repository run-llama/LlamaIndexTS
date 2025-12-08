import { GEMINI_EMBEDDING_MODEL, GeminiEmbedding } from "@llamaindex/google";

const requests_per_minute_limit = 3000; // cf. https://ai.google.dev/gemini-api/docs/rate-limits

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const embedModel = new GeminiEmbedding({
    model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
  });
  const texts = Array.from(
    { length: requests_per_minute_limit + 1000 },
    (_, i) => `text ${i}`,
  );
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
}

main().catch(console.error);
