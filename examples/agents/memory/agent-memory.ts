import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { createMemory, staticBlock } from "llamaindex";

// Simple example: Agent with Predefined Memory
async function simpleAgentMemoryExample() {
  console.log("=== Simple Agent Memory Example ===");

  const memory = createMemory({
    memoryBlocks: [
      staticBlock({
        content:
          "The user is a software engineer who loves TypeScript and LlamaIndex.",
      }),
    ],
  });

  // Create agent workflow
  const workflow = agent({
    name: "assistant",
    llm: openai({ model: "gpt-4.1-nano" }),
    memory,
  });

  // Test - agent should remember John and the shopping cart context
  console.log("\n--- Testing Memory Context ---");
  const result = await workflow.run("Hi, my name is John. Do you know me?");

  console.log("Assistant Response:", result.data.result);

  const result2 = await workflow.run("What is my name?");
  console.log("Assistant Response:", result2.data.result);
}

// Run the example
simpleAgentMemoryExample().catch(console.error);
