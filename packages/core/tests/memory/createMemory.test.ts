import { Settings } from "@llamaindex/core/global";
import type { ChatMessage } from "@llamaindex/core/llms";
import { createMemory, staticMemoryBlock } from "@llamaindex/core/memory";
import { beforeEach, describe, expect, test } from "vitest";

describe("createMemory factory function", () => {
  beforeEach(() => {
    // Mock the Settings.llm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Settings.llm as any) = {
      metadata: {
        contextWindow: 1000,
        maxTokens: 100,
      },
    };
  });

  test("creates memory with default settings", () => {
    const memory = createMemory();
    expect(memory).toBeDefined();
    expect(typeof memory.add).toBe("function");
    expect(typeof memory.get).toBe("function");
    expect(typeof memory.getLLM).toBe("function");
    expect(typeof memory.clear).toBe("function");
    expect(typeof memory.snapshot).toBe("function");
    expect(typeof memory.loadSnapshot).toBe("function");
  });

  test("creates memory with custom token limit", () => {
    const memory = createMemory({ tokenLimit: 5000 });
    expect(memory).toBeDefined();
  });

  test("creates memory with memory blocks", () => {
    const blocks = [staticMemoryBlock(["You are a helpful assistant."], 0)];
    const memory = createMemory({ blocks });
    expect(memory).toBeDefined();
  });

  test("supports basic operations", async () => {
    const memory = createMemory({ tokenLimit: 1000 });

    // Test add and get
    const message: ChatMessage = { content: "Hello", role: "user" };
    await memory.add(message);

    const messages = await memory.get();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe("Hello");
  });

  // test("supports snapshot operations", async () => {
  //   const memory = createMemory({ tokenLimit: 1000 });

  //   await memory.add({ content: "Test message", role: "user" });

  //   const snapshot = memory.snapshot();
  //   expect(snapshot).toHaveProperty("blocks");
  //   expect(snapshot).toHaveProperty("metadata");

  //   const newMemory = createMemory();
  //   await newMemory.loadSnapshot(snapshot);

  //   const messages = await newMemory.get();
  //   expect(messages).toHaveLength(1);
  //   expect(messages[0]?.content).toBe("Test message");
  // });

  test("supports backward compatibility methods", async () => {
    const memory = createMemory({ tokenLimit: 1000 });

    // Test legacy methods exist and work
    const message: ChatMessage = { content: "Hello", role: "user" };
    memory.add(message);

    const messages = await memory.get();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe("Hello");

    await memory.clear();
    const emptyMessages = await memory.get();
    expect(emptyMessages).toHaveLength(0);
  });

  test("creates memory with different message format support", async () => {
    const memory = createMemory({ tokenLimit: 1000 });

    await memory.add({ content: "LlamaIndex message", role: "user" });

    const llamaMessages = await memory.get({ type: "llamaindex" });
    expect(llamaMessages).toHaveLength(1);

    const uiMessages = await memory.get({ type: "vercel" });
    expect(uiMessages).toHaveLength(1);
  });
});
