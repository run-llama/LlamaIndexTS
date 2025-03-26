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
import { SupabaseVectorStore } from "../../../packages/providers/storage/supabase/src";
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
  const vectorStore = new SupabaseVectorStore({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    table: "document",
  });

  // await vectorStore.delete("fc079c38-2af4-4782-96e4-955c28608fcf");

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
