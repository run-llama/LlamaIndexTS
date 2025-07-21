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
import { createMemory, Settings, vectorBlock } from "llamaindex";

// Set up the LLM and embedding model
Settings.llm = new OpenAI({ model: "gpt-4.1-mini" });
Settings.embedModel = new OpenAIEmbedding({ model: "text-embedding-ada-002" });

// Simulate a conversation with some context
// This conversation has 8 messages, which is more than the token limit of 100 tokens (set below)
// The last 3 messages are kept in to short term memory block (as their tokens are in the limit)
// Whereas the first 5 messages are added to long term memory block (in here we will use the vector memory block with Qdrant)
const CONVERSATION_TURNS = [
  //// This is the first 5 messages that are added to long term memory block (vector memory block)
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

  //// This is the last 3 messages that are added to short term memory block
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

  // Add a new user request to the memory
  await memory.add({
    role: "user",
    content: "Summary information about Sarah and her cats",
  });

  // Retrieve relevant context for the current user request
  console.log("Retrieving relevant context...");
  const chatHistory = await memory.getLLM(Settings.llm);

  // You will see there's 1 generated context message from vector memory block, and 3 messages from short term memory block
  console.log("Chat memory:", chatHistory);

  // Now simulate the assistant responding with context
  console.log("\nAssistant response with context:");
  const response = await Settings.llm.chat({
    messages: chatHistory,
  });
  console.log(response.message.content);

  // Try adding more messages to the memory
  const newMessages = [
    {
      role: "user",
      content: "Write a long paragraph about weather in Tokyo",
    },
    {
      role: "assistant",
      content:
        "The weather in Tokyo is sunny and warm. The temperature is around 20 degrees Celsius. The weather is very nice and the people are friendly.",
    },
  ];
  // Add the new messages to the memory
  for (const message of newMessages) {
    await memory.add(message);
  }

  // Add a new user request to the memory
  await memory.add({
    role: "user",
    content: "Summary about weather in Tokyo",
  });

  // Try retrieving the new messages
  const newChatHistory = await memory.getLLM(Settings.llm);
  // You can see now new chat history will contain 2 nodes from vector memory block
  // (default similarityTopK is 2, you can change it by setting `similarityTopK` in queryOptions of vectorBlock)
  console.log("New chat history:", newChatHistory);
}

main().catch(console.error);
