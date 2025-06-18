import { Settings } from "@llamaindex/core/global";
import type { ChatMessage } from "@llamaindex/core/llms";
import { beforeEach, describe, expect, test } from "vitest";

import type { UIMessage, UIPart } from "@llamaindex/core/memory";
import { Memory, staticMemoryBlock } from "@llamaindex/core/memory";

describe("Memory", () => {
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

  describe("constructor and initialization", () => {
    test("creates with default options", () => {
      const memory = new Memory();
      expect(memory).toBeInstanceOf(Memory);
    });

    test("creates with custom token limit", () => {
      const memory = new Memory({ tokenLimit: 5000 });
      // Test through behavior rather than private property access
      expect(memory).toBeInstanceOf(Memory);
    });

    test("creates with memory blocks", () => {
      const blocks = [staticMemoryBlock([], 0)];
      const memory = new Memory({ blocks });
      // Test through behavior rather than private property access
      expect(memory).toBeInstanceOf(Memory);
    });
  });

  describe("new API methods", () => {
    let memory: Memory;

    beforeEach(() => {
      memory = new Memory({ tokenLimit: 1000 });
    });

    describe("add method", () => {
      test("adds ChatMessage successfully", async () => {
        const message: ChatMessage = { content: "Hello", role: "user" };
        await memory.add(message);

        const messages = await memory.get();
        expect(messages).toHaveLength(1);
        expect(messages[0]?.content).toBe("Hello");
      });

      test("adds UIMessage successfully", async () => {
        const uiMessage: UIMessage = {
          id: "msg-1",
          content: "Hello from UI",
          role: "user",
          parts: [{ type: "text", content: "Hello from UI" } as UIPart],
          createdAt: new Date(),
        };

        await memory.add(uiMessage);
        const messages = await memory.get();
        expect(messages).toHaveLength(1);
      });

      test("adds multiple messages in sequence", async () => {
        const messages = [
          { content: "Hello", role: "user" as const },
          { content: "Hi there!", role: "assistant" as const },
          { content: "How are you?", role: "user" as const },
        ];

        for (const msg of messages) {
          await memory.add(msg);
        }

        const storedMessages = await memory.get();
        expect(storedMessages).toHaveLength(3);
      });

      test("throws error for invalid message format", async () => {
        const invalidMessage = { content: "test" }; // missing role
        await expect(
          memory.add(invalidMessage as unknown as ChatMessage),
        ).rejects.toThrow();
      });
    });

    describe("get method", () => {
      beforeEach(async () => {
        await memory.add({ content: "Hello", role: "user" });
        await memory.add({ content: "Hi there!", role: "assistant" });
      });

      test("returns messages in LlamaIndex format by default", async () => {
        const messages = await memory.get();
        expect(messages).toHaveLength(2);
        expect(messages[0]).toHaveProperty("content");
        expect(messages[0]).toHaveProperty("role");
      });

      test("returns messages in LlamaIndex format when specified", async () => {
        const messages = await memory.get({ type: "llamaindex" });
        expect(messages).toHaveLength(2);
        expect(messages[0]).toHaveProperty("content");
        expect(messages[0]).toHaveProperty("role");
      });

      test("returns messages in UI format when specified", async () => {
        const messages = await memory.get({ type: "vercel" });
        expect(messages).toHaveLength(2);
        // UI messages should have id, parts, etc.
        expect(messages[0]).toHaveProperty("id");
        expect(messages[0]).toHaveProperty("parts");
        expect(messages[0]).toHaveProperty("content");
        expect(messages[0]).toHaveProperty("role");
      });

      test("handles empty memory", async () => {
        const emptyMemory = new Memory();
        const messages = await emptyMemory.get();
        expect(messages).toHaveLength(0);
      });
    });

    describe("getLLM method", () => {
      test("returns token-limited messages", async () => {
        const shortMemory = new Memory({ tokenLimit: 10 });

        // Add messages that exceed token limit
        await shortMemory.add({
          content: "Very long message that exceeds token limit",
          role: "user",
        });
        await shortMemory.add({
          content: "Another long message",
          role: "assistant",
        });
        await shortMemory.add({ content: "Short", role: "user" });

        const llmMessages = await shortMemory.getLLM();
        const allMessages = await shortMemory.get();

        expect(llmMessages.length).toBeLessThanOrEqual(allMessages.length);
      });

      test("includes memory blocks in LLM messages", async () => {
        const blocks = [staticMemoryBlock(["System instruction"], 0)];
        const memoryWithBlocks = new Memory({
          blocks,
          tokenLimit: 1000,
        });

        await memoryWithBlocks.add({ content: "User message", role: "user" });

        const llmMessages = await memoryWithBlocks.getLLM();
        expect(llmMessages.length).toBeGreaterThan(1); // Should include block + user message
      });

      test("prioritizes recent messages when token limit is exceeded", async () => {
        const memory = new Memory({ tokenLimit: 20 });

        await memory.add({ content: "Old message", role: "user" });
        await memory.add({ content: "Recent message", role: "user" });

        const llmMessages = await memory.getLLM();
        const lastMessage = llmMessages[llmMessages.length - 1];
        expect(lastMessage?.content).toBe("Recent message");
      });
    });

    describe("clear method", () => {
      test("clears all messages", async () => {
        await memory.add({ content: "Hello", role: "user" });
        await memory.add({ content: "Hi there!", role: "assistant" });

        let messages = await memory.get();
        expect(messages).toHaveLength(2);

        await memory.clear();
        messages = await memory.get();
        expect(messages).toHaveLength(0);
      });
    });
  });

  describe("memory blocks functionality", () => {
    test("includes static blocks in LLM messages", async () => {
      const blocks = [
        staticMemoryBlock(["You are a helpful assistant."], 0),
        staticMemoryBlock(["Always be polite."], 0),
      ];

      const memory = new Memory({ blocks, tokenLimit: 1000 });
      await memory.add({ content: "Hello", role: "user" });

      const llmMessages = await memory.getLLM();
      expect(llmMessages.length).toBe(3);

      // First messages should be from blocks (converted to system messages)
      expect(llmMessages[0]?.content).toBe("You are a helpful assistant.");
      expect(llmMessages[1]?.content).toBe("Always be polite.");
      expect(llmMessages[2]?.content).toBe("Hello");
    });
  });

  describe("error handling", () => {
    let memory: Memory;

    beforeEach(() => {
      memory = new Memory({ tokenLimit: 1000 });
    });

    test("handles invalid message types gracefully", async () => {
      const invalidMessage = { content: 123, role: "user" }; // invalid content type
      await expect(
        memory.add(invalidMessage as unknown as ChatMessage),
      ).rejects.toThrow();
    });

    test("handles token limit edge cases", async () => {
      const verySmallMemory = new Memory({ tokenLimit: 1 });
      await verySmallMemory.add({
        content: "This message is too long for the token limit",
        role: "user",
      });

      const llmMessages = await verySmallMemory.getLLM();
      // Should handle gracefully, possibly returning empty array
      expect(Array.isArray(llmMessages)).toBe(true);
    });
  });
});
