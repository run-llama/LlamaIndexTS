import { openai } from "@llamaindex/openai";
import { createMemory } from "llamaindex";

// Example: Basic Memory Usage with Factory
async function basicMemoryExample() {
  console.log("\n=== Example: Basic Memory Usage with Factory ===");

  // Create memory using factory function - no need to specify [] for empty messages
  const memory = createMemory({ tokenLimit: 30 });

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
  // Not all messages are included because of token limit is set to 30
  const llmMessages = await memory.getLLM();
  console.log(
    `\nLLM messages (${llmMessages.length} messages) limited by a small token limit:`,
  );
  llmMessages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role}: ${msg.content}`);
  });

  // But the token limit above will be the window size of an LLM instance if you use getLLM with LLM
  const llm = openai({ model: "gpt-4.1-mini" });
  const llmMessagesWithLLM = await memory.getLLM(llm);
  // Now all the messages are included because of the LLM window size of the model is much larger
  console.log(
    `\nLLM messages with LLM (${llmMessagesWithLLM.length} messages) limited by LLM window size:`,
  );
  llmMessagesWithLLM.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.role}: ${msg.content}`);
  });
}

// Main function
async function main() {
  console.log("🧠 Basic Memory Factory Examples");
  console.log("===============================");

  try {
    await basicMemoryExample();
  } catch (error) {
    console.error("Error running basic memory examples:", error);
  }
}

main().catch(console.error);
