import {
  Document,
  OpenAI,
  OpenAIContextAwareAgent,
  VectorStoreIndex,
} from "llamaindex";

import dotenv from "dotenv";
dotenv.config();

async function createTestContextAwareAgent() {
  // Create test documents
  const testDocument1 = new Document({
    text: "LlamaIndex is a data framework for LLM applications to ingest, structure, and access private or domain-specific data.",
    id_: "doc1",
  });

  const testDocument2 = new Document({
    text: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower.",
    id_: "doc2",
  });

  const testDocument3 = new Document({
    text: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments.",
    id_: "doc3",
  });

  // Create a test index
  const testIndex = await VectorStoreIndex.fromDocuments([
    testDocument1,
    testDocument2,
    testDocument3,
  ]);

  // Create a retriever from the index to get only 1 relevant document
  const testRetriever = testIndex.asRetriever({
    similarityTopK: 1,
  });

  // Create an OpenAI Context-Aware Agent with the retriever
  const contextAwareAgent = new OpenAIContextAwareAgent({
    llm: new OpenAI({ model: "gpt-4o-mini" }),
    tools: [],
    contextRetriever: testRetriever,
  });

  // Test the agent with a query that should trigger relevant document retrieval
  const response = await contextAwareAgent.chat({
    message: "What is LlamaIndex used for?",
  });

  console.log("Context-aware Agent Response:", response.response);
}

createTestContextAwareAgent().catch(console.error);
