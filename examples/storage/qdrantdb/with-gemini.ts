import {
  GEMINI_EMBEDDING_MODEL,
  GeminiEmbedding,
  GeminiSession,
} from "@llamaindex/google";
import { QdrantVectorStore } from "@llamaindex/qdrant";
import {
  Document,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const embedding = new GeminiEmbedding({
  model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
  session: new GeminiSession({
    apiKey: process.env.GEMINI_API_KEY,
  }),
});

async function main() {
  const docs = [new Document({ text: "Lorem ipsum dolor sit amet" })];
  const vectorStore = new QdrantVectorStore({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    embeddingModel: embedding,
    collectionName: "gemini_test",
  });
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(docs, { storageContext });
  console.log("Inizialized vector store successfully");
}

void main().catch((err) => console.error(err));
