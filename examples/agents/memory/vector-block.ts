/**
 * Example: Vector Memory Block
 *
 * This example demonstrates how to use the VectorMemoryBlock to store and retrieve
 * conversation history using vector similarity search. The vector memory block
 * stores messages in a vector store and can retrieve relevant context based on
 * semantic similarity to recent messages.
 */

import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { QdrantVectorStore } from "@llamaindex/qdrant";
import { ChatMessage, createMemory, Settings, vectorBlock } from "llamaindex";

// Set up the LLM and embedding model
Settings.llm = new OpenAI({ model: "gpt-3.5-turbo" });
Settings.embedModel = new OpenAIEmbedding({ model: "text-embedding-ada-002" });

// Simulate a conversation with some context
const CONVERSATION_TURNS = [
  {
    role: "user",
    content: "Hi, I'm Sarah and I work as a data scientist at Google.",
  },
  {
    role: "assistant",
    content:
      "Hello Sarah! It's great to meet you. Data science at Google must be exciting!",
  },
  {
    role: "user",
    content:
      "Yes, I specialize in machine learning and natural language processing.",
  },
  {
    role: "assistant",
    content: "That's impressive! ML and NLP are fascinating fields.",
  },
  {
    role: "user",
    content:
      "I have a PhD in Computer Science from Stanford, and I love hiking on weekends.",
  },
  {
    role: "assistant",
    content:
      "Wow, Stanford PhD! And hiking is a great way to unwind from tech work.",
  },
  {
    role: "user",
    content: "I also have two cats named Whiskers and Mittens.",
  },
  {
    role: "assistant",
    content:
      "Cats make wonderful companions! Whiskers and Mittens are cute names.",
  },
];

async function main() {
  console.log("=== Vector Memory Block Example ===\n");

  /**
   * Create a vector store. You can quickly get a local instance of Qdrant running with Docker:
   * ```bash
   * docker pull qdrant/qdrant
   * docker run -p 6333:6333 qdrant/qdrant
   * ```
   *
   * Go to http://localhost:6333/dashboard#/collections to see your data
   */
  const vectorStore = new QdrantVectorStore({
    url: "http://localhost:6333",
  });

  // Create a vector memory block using the factory function
  const vectorMemoryBlock = vectorBlock({
    vectorStore,
    priority: 5,
    isLongTerm: true,
  });

  // Create a memory store with the vector memory block
  const memory = createMemory([], {
    memoryBlocks: [vectorMemoryBlock],
    tokenLimit: 100,
    shortTermTokenLimitRatio: 0.7,
  });

  // Store the conversation history in the vector memory
  console.log(`Adding ${CONVERSATION_TURNS.length} messages to the memory...`);
  for (const message of CONVERSATION_TURNS) {
    await memory.add(message);
  }

  // Retrieve relevant context for the current user request
  const newUserRequest: ChatMessage = {
    role: "user",
    content: "Summary information about Sarah",
  };
  console.log("Retrieving relevant context...");
  const retrievedMessages = await memory.getLLM(Settings.llm, [newUserRequest]);
  console.log("\nRetrieved context:\n", retrievedMessages[0]?.content);

  // Now simulate the assistant responding with context
  console.log("\nAssistant response with context:");
  const contextMessage = retrievedMessages[0];
  const response = await Settings.llm.chat({
    messages: [...(contextMessage ? [contextMessage] : []), newUserRequest],
  });

  console.log(response.message.content);
}

main().catch(console.error);
