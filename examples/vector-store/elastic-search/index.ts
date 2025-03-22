import { ElasticSearchVectorStore } from "@llamaindex/elastic-search";
import {
  gemini,
  GEMINI_EMBEDDING_MODEL,
  GEMINI_MODEL,
  GeminiEmbedding,
} from "@llamaindex/google";
import {
  Document,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
async function main() {
  Settings.embedModel = new GeminiEmbedding({
    model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
  });
  Settings.llm = gemini({
    model: GEMINI_MODEL.GEMINI_PRO_1_5_FLASH,
  });
  // Create sample documents
  const documents = [
    new Document({
      text: "Elastic search is a powerful search engine",
      metadata: {
        source: "tech_docs",
        author: "John Doe",
      },
    }),
    new Document({
      text: "Vector search enables semantic similarity search",
      metadata: {
        source: "research_paper",
        author: "Jane Smith",
      },
    }),
    new Document({
      text: "Elasticsearch supports various distance metrics for vector search",
      metadata: {
        source: "tech_docs",
        author: "Bob Wilson",
      },
    }),
  ];

  // Initialize ElasticSearch Vector Store
  const vectorStore = new ElasticSearchVectorStore({
    indexName: "llamaindex-demo",
    esCloudId: process.env.ES_CLOUD_ID,
    esApiKey: process.env.ES_API_KEY,
    batchSize: 100,
  });

  // Create storage context with the vector store
  const storageContext = await storageContextFromDefaults({
    vectorStore,
  });

  // Create and store embeddings in ElasticSearch
  const index = await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });

  // Query the index
  const queryEngine = index.asQueryEngine();

  // Simple query
  const response = await queryEngine.query({
    query: "What is vector search?",
  });
  console.log("Basic Query Response:", response.toString());
}

main().catch(console.error);
