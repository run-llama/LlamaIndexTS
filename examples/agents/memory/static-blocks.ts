import { openai } from "@llamaindex/openai";
import { createMemory, staticBlock } from "llamaindex";

// Configure OpenAI
const llm = openai({ model: "gpt-4.1-mini" });

// Example: Memory with Static Blocks
async function staticMemoryBlockExample() {
  console.log("\n=== Memory with Static Blocks ===");
  console.log("- Memory always include static block");
  console.log("- Memory cut off the messages within token limit\n");

  // Create memory with a static block
  const memory = createMemory([], {
    tokenLimit: 30, // A small token which is not enough for a whole conversation below
    memoryBlocks: [
      staticBlock({
        content:
          "The user's name is John and he is a software engineer who loves TypeScript and LlamaIndex.",
      }),
    ],
  });

  // Add some messages to the memory
  await memory.add({
    role: "user",
    content: "What do you know about me?",
  });

  await memory.add({
    role: "assistant",
    content:
      "Based on our conversation, I know you're John, a software engineer who enjoys working with TypeScript and LlamaIndex!",
  });

  await memory.add({
    role: "user",
    content: "Which language does LlamaIndex support?",
  });

  // Get messages
  // static block will always be included
  // only the last message will be included because of token limit is set above
  const messages = await memory.getLLM(llm);
  messages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role}: ${msg.content}`);
  });
  // Messages with static block:
  // 1. user: The user's name is John and he is a software engineer who loves TypeScript and LlamaIndex.
  // 2. user: Which language does LlamaIndex support?
}

// Main function
async function main() {
  try {
    await staticMemoryBlockExample();
  } catch (error) {
    console.error("Error running static memory blocks example:", error);
  }
}

main().catch(console.error);
