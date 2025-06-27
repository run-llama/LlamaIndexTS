import { openai } from "@llamaindex/openai";
import { createMemory, factExtractionBlock } from "llamaindex";

// Configure OpenAI
const llm = openai({ model: "gpt-4.1-mini" });

// Example: Memory with Fact Extraction
async function factExtractionMemoryExample() {
  console.log("\n=== Memory with Fact Extraction ===");

  // Create memory with a fact extraction
  const memory = createMemory([], {
    tokenLimit: 100,
    shortTermTokenLimitRatio: 0.7, // 70% for short-term, 30% for long-term
    memoryBlocks: [
      factExtractionBlock({
        id: "user-facts",
        priority: 5,
        llm: openai({ model: "gpt-4.1-nano" }),
        maxFacts: 10,
        isLongTerm: true,
      }),
    ],
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

// Main function
async function main() {
  console.log("🧠 Fact Extraction Memory Example");
  console.log("=================================");

  try {
    await factExtractionMemoryExample();
  } catch (error) {
    console.error("Error running fact extraction memory example:", error);
  }
}

main().catch(console.error);
