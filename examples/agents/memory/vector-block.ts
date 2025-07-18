/**
 * Example: Vector Memory Block
 *
 * This example demonstrates how to use the VectorMemoryBlock to store and retrieve
 * conversation history using vector similarity search. The vector memory block
 * stores messages in a vector store and can retrieve relevant context based on
 * semantic similarity to recent messages.
 */

import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import {
  createMemory,
  PromptTemplate,
  Settings,
  SimpleVectorStore,
  vectorBlock,
  VectorStoreQueryMode,
} from "llamaindex";

// Set up the LLM and embedding model
Settings.llm = new OpenAI({ model: "gpt-3.5-turbo" });
Settings.embedModel = new OpenAIEmbedding({ model: "text-embedding-ada-002" });

async function main() {
  console.log("=== Vector Memory Block Example ===\n");

  // Create a simple in-memory vector store
  const vectorStore = new SimpleVectorStore();

  // Create a vector memory block using the factory function
  const vectorMemoryBlock = vectorBlock({
    vectorStore,
    retrievalContextWindow: 2,
    formatTemplate: new PromptTemplate({
      template: "Previous conversation context:\n{{ text }}",
    }),
    queryOptions: {
      similarityTopK: 3,
      mode: VectorStoreQueryMode.DEFAULT,
    },
    priority: 1,
  });

  // Create a memory store with the vector memory block
  const memory = createMemory({
    memoryBlocks: [vectorMemoryBlock],
  });

  // Simulate a conversation with some context
  const messages = [
    {
      id: "1",
      role: "user" as const,
      content:
        "My name is Alice and I love programming in Python. I work as a data scientist.",
    },
    {
      id: "2",
      role: "assistant" as const,
      content:
        "Nice to meet you Alice! Python is a great programming language for data science.",
    },
    {
      id: "3",
      role: "user" as const,
      content: "What's my name and what do I like?",
    },
  ];

  // Store the conversation history in the vector memory
  console.log("Storing conversation history...");
  for (const message of messages.slice(0, 2)) {
    await memory.add(message);
  }

  // Retrieve relevant context for the current query
  console.log("Retrieving relevant context...");
  const retrievedMessages = await vectorMemoryBlock.get();

  console.log("Retrieved context:");
  console.log(retrievedMessages[0]?.content);
  console.log("\n---\n");

  // Now simulate the assistant responding with context
  console.log("Generating response with context...");
  const contextMessage = retrievedMessages[0];
  const response = await Settings.llm.chat({
    messages: [...(contextMessage ? [contextMessage] : []), messages[2]!],
  });

  console.log("Assistant response with context:");
  console.log(response.message.content);
}

main().catch(console.error);
