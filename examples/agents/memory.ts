import { OpenAI } from "@llamaindex/openai";
import {
  FactExtractionMemoryBlock,
  Memory,
  StaticMemoryBlock,
} from "llamaindex";

// Configure OpenAI
const llm = new OpenAI({ model: "gpt-4.1-mini" });

// Example 1: Basic Memory Usage
async function basicMemoryExample() {
  console.log("\n=== Example 1: Basic Memory Usage ===");

  const memory = new Memory();

  // Add messages to memory
  await memory.add({
    role: "user",
    content: "Hi, my name is John and I'm a software engineer.",
  });

  await memory.add({
    role: "assistant",
    content: "Hello John! Nice to meet you. How can I help you today?",
  });

  await memory.add({
    role: "user",
    content: "I love working with TypeScript and React.",
  });

  // Retrieve messages
  const messages = await memory.get();
  console.log("Messages in memory:");
  messages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role}: ${msg.content}`);
  });

  // Get messages optimized for LLM (with token limits)
  const llmMessages = await memory.getLLM(llm);
  console.log(`\nLLM messages (${llmMessages.length} messages):`);
  llmMessages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role}: ${msg.content}`);
  });
}

// Example 2: Memory with Static Blocks
async function staticMemoryBlockExample() {
  console.log("\n=== Example 2: Memory with Static Blocks ===");

  // Create a static memory block with system information
  const systemBlock = new StaticMemoryBlock({
    id: "system-info",
    priority: 0, // Always included (highest priority)
    staticContent:
      "You are a helpful AI assistant. The user's name is John and he is a software engineer who loves TypeScript and React.",
    messageRole: "system",
    isLongTerm: false,
  });

  // Create memory with the static block
  const memory = new Memory([], {
    tokenLimit: 2000,
    memoryBlocks: [systemBlock],
  });

  // Add conversation messages
  await memory.add({
    role: "user",
    content: "What do you know about me?",
  });

  await memory.add({
    role: "assistant",
    content:
      "Based on our conversation, I know you're John, a software engineer who enjoys working with TypeScript and React!",
  });

  // Get messages - static block will always be included
  const messages = await memory.getLLM(llm);
  console.log("Messages with static block:");
  messages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role}: ${msg.content}`);
  });
}

// Example 3: Memory with Fact Extraction
async function factExtractionMemoryExample() {
  console.log("\n=== Example 3: Memory with Fact Extraction ===");

  // Create a fact extraction memory block
  const factBlock = new FactExtractionMemoryBlock({
    id: "user-facts",
    priority: 5,
    llm: new OpenAI({ model: "gpt-4.1-nano" }),
    maxFacts: 10,
    isLongTerm: true,
  });

  // Create memory with fact extraction
  const memory = new Memory([], {
    tokenLimit: 100,
    shortTermTokenLimitRatio: 0.7, // 70% for short-term, 30% for long-term
    memoryBlocks: [factBlock],
  });

  // Simulate a conversation with facts
  const conversationTurns = [
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

  // Add conversation turns to memory
  console.log("Adding conversation to memory...");
  for (const turn of conversationTurns) {
    await memory.add(turn);
  }

  // Get messages - facts should be extracted and included
  const messages = await memory.getLLM(llm);
  console.log("\nMessages with extracted facts:");
  messages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role ?? "unknown"}: ${msg.content}`);
  });
  //Messages with extracted facts:
  // 1. assistant: Cats make wonderful companions! Whiskers and Mittens are cute names.
  // 2. user: I also have two cats named Whiskers and Mittens.
  // 3. assistant: Wow, Stanford PhD! And hiking is a great way to unwind from tech work.
  // 4. memory: Sarah works as a data scientist at Google
  // Sarah specializes in machine learning and natural language processing
  // Sarah has a PhD in Computer Science from Stanford
  // Sarah enjoys hiking on weekends
}

// Main function to run all examples
async function main() {
  console.log("🧠 LlamaIndexTS Memory Examples");
  console.log("================================");

  try {
    await basicMemoryExample();
    await staticMemoryBlockExample();
    await factExtractionMemoryExample();
  } catch (error) {
    console.error("Error running memory examples:", error);
  }
}

main().catch(console.error);
