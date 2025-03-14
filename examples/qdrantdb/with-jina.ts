import { JinaAIEmbedding } from "@llamaindex/jinaai";
import { QdrantVectorStore } from "@llamaindex/qdrant";
import {
  Document,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const embedding = new JinaAIEmbedding({
  apiKey: process.env.JINAAI_API_KEY,
  model: "jina-embeddings-v3",
});

async function main() {
  const docs = [new Document({ text: "Lorem ipsum dolor sit amet" })];
  const vectorStore = new QdrantVectorStore({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    embeddingModel: embedding,
    collectionName: "jina_test",
  });
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(docs, { storageContext });
  console.log("Inizialized vector store successfully");
}

void main().catch((err) => console.error(err));
