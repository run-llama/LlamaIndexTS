import { Document, MetadataMode } from "@llamaindex/core/schema";
import { config } from "dotenv";
import {
  OpenAIEmbedding,
  PineconeVectorStore,
  VectorStoreIndex,
} from "llamaindex";
import assert from "node:assert";
import { test } from "node:test";

config({ path: [".env.local", ".env", ".env.ci"] });

await test("pinecone", async (t) => {
  if (
    process.env.PINECONE_API_KEY === undefined ||
    process.env.PINECONE_NAMESPACE === undefined ||
    process.env.PINECONE_INDEX_NAME === undefined
  ) {
    t.skip(
      "PINECONE_API_KEY, PINECONE_NAMESPACE, and PINECONE_INDEX_NAME must be set to run this test",
    );
  }
  const openaiEmbedding = new OpenAIEmbedding({
    model: "text-embedding-3-large",
  });

  const vectorStore = new PineconeVectorStore({
    embeddingModel: openaiEmbedding,
  });

  t.after(async () => {
    await vectorStore.clearIndex();
  });

  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  const retriever = index.asRetriever({
    similarityTopK: 3,
  });
  const text = "We are open from 9am to 5pm";

  await vectorStore.add([
    new Document({
      text,
      embedding: await openaiEmbedding.getTextEmbedding(text),
    }),
  ]);

  const results = await retriever.retrieve({
    query: "When are you open?",
  });
  results.every((result) => {
    assert.ok(result.node.embedding instanceof Array);
    result.node.embedding.every((embedding, idx) =>
      assert.ok(
        typeof embedding === "number",
        `Embedding at index ${idx} should be a number`,
      ),
    );
    assert.ok(typeof result.score === "number", "Score should be a number");
    assert.ok(
      result.node.getContent(MetadataMode.NONE).length > 0,
      "Content should not be empty",
    );
  });
});
