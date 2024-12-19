import { VoyageAIEmbedding } from "llamaindex";

async function main() {
  // API token can be provided as an environment variable too
  // using VOYAGE_API_TOKEN variable
  const apiKey = process.env.VOYAGE_API_TOKEN ?? "YOUR_API_TOKEN";
  const model = "voyage-3-lite";
  const embedModel = new VoyageAIEmbedding({
    model,
    apiKey,
  });
  const texts = ["hello", "world"];
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
}

main().catch(console.error);
