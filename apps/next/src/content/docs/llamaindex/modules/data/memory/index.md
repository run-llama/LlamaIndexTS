---
title: Memory
description: Manage conversation history and context with intelligent memory blocks
---

Memory provides intelligent conversation history management with automatic context window optimization for LLMs and long-term memory storage through configurable memory blocks.

## Overview

The Memory class handles:

- **Message Storage**: Store and retrieve conversation messages with different adapters
- **Context Management**: Automatically fit messages within LLM context windows. Balance short-term and long-term memory usage within token limits.
- **Memory Blocks**: Include predefined contextual information or process messages into long-term memory blocks for summarization or retrieval
- **Snapshots**: Save and restore memory state for persistence

## Basic Usage

```ts twoslash
import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { createMemory, staticBlock } from "llamaindex";

const llm = openai({ model: "gpt-4o-mini" });

// Create memory with predefined context
const memory = createMemory({
  memoryBlocks: [
    staticBlock({
      content:
        "The user is a software engineer who loves TypeScript and LlamaIndex.",
    }),
  ],
});

// Create an agent with the memory
const workflow = agent({
  name: "assistant",
  llm,
  memory,
});

const result1 = await workflow.run("Hi, my name is John. Do you know me?");
console.log("Response:", result1.data.result);

const result2 = await workflow.run("What is my name?");
console.log("Response:", result2.data.result);

// You can also manually get messages with transient messages:
const messages = await memory.getLLM(llm, [
  {
    role: "user",
    content: "What is my name?", // This message will be included in the result and won't be stored in the memory
  },
]);

// You can also put messages in Vercel format directly to the memory
await memory.add({
  id: "1",
  createdAt: new Date(),
  role: "user",
  content: "Hello!",
  options: {
    parts: [
      {
        type: "file",
        data: "base64...",
        mimeType: "image/png",
      },
    ],
  },
});

// and get it back in Vercel format
const messages = await memory.get({ type: "vercel" });
console.log(messages);
```

## Configuration Options

Configure memory behavior with `MemoryOptions`:

- `tokenLimit`: Maximum tokens for memory retrieval.
- `shortTermTokenLimitRatio`: Ratio of tokens for short-term vs long-term memory (default: 0.5)
- `customAdapters`: Custom message adapters for different message formats. LlamaIndex (ChatMessageAdapter) and Vercel (VercelMessageAdapter) are built-in adapters.
- `memoryBlocks`: Memory blocks for long-term storage

## Memory Blocks

Memory blocks hold contextual information that always included in the memory or long-term information that enriches the context of the conversation that can be included in priority order within token limits. The order of messages retrieved from getLLM() method are:

1. StaticMemoryBlock (always included)
2. LongTermMemoryBlock
3. ShortTermMemoryBlock
4. Transient messages

We provided some built-in memory blocks for you:

- [Static Memory Block](/docs/api/classes/StaticMemoryBlock): Keeps track of static, non-changing information
- [Fact Extraction Memory Block](/docs/api/classes/FactExtractionMemoryBlock) (long-term): Populates a list of facts extracted from the conversation when the messages are outside of Memory token limits. Check out [this example](https://github.com/run-llama/LlamaIndexTS/tree/main/examples/agents/memory/fact-extraction.ts) for the usage of the Fact Extraction Memory Block.

## Persistence with Snapshots

Save and restore memory state:

```ts twoslash
import { createMemory, loadMemory } from "llamaindex";

const memory = createMemory();

// Add some messages
await memory.add({ role: "user", content: "Hello!" });

// Create snapshot
const snapshot = memory.snapshot();

// Later, restore from the snapshot
const restoredMemory = loadMemory(snapshot);
```

Want to learn more about the Memory class? Check out our example codes in [Github](https://github.com/run-llama/LlamaIndexTS/tree/main/examples/agents/memory).
