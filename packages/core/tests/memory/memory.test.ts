import { Settings } from "@llamaindex/core/global";
import type { ChatMessage, LLM } from "@llamaindex/core/llms";
import { Memory } from "@llamaindex/core/memory";
import { MockLLM } from "@llamaindex/core/utils";
import type { Tokenizer } from "@llamaindex/env/tokenizers";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

// Mock tokenizer that returns predictable token counts
const createMockTokenizer = (): Tokenizer => ({
  encode: (text: string): Uint32Array => {
    // Simple mock: 1 token per 4 characters (rounded up)
    const tokenCount = Math.ceil(text.length / 4);
    return new Uint32Array(Array.from({ length: tokenCount }, (_, i) => i));
  },
  decode: (tokens: Uint32Array): string => {
    // Simple mock: just return a string based on token count
    return `decoded_${tokens.length}_tokens`;
  },
});

// Helper function to create mock LLMs with different context windows
const createMockLLM = (contextWindow: number): LLM =>
  new MockLLM({
    metadata: {
      contextWindow,
      model: "test-model",
      temperature: 0.7,
      topP: 1.0,
      tokenizer: undefined,
      structuredOutput: false,
    },
  });

describe("Memory", () => {
  let memory: Memory;
  let originalTokenizer: Tokenizer;

  beforeAll(() => {
    // Save original tokenizer and set mock
    originalTokenizer = Settings.tokenizer;
    Settings.tokenizer = createMockTokenizer();
  });

  afterAll(() => {
    // Restore original tokenizer
    Settings.tokenizer = originalTokenizer;
  });

  beforeEach(() => {
    memory = new Memory();
  });

  describe("add", () => {
    test("should add LlamaIndex ChatMessage", async () => {
      const message: ChatMessage = {
        role: "user",
        content: "Hello, world!",
      };

      await memory.add(message);
      const messages = await memory.get();

      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    test("should add Vercel UI Message and convert to ChatMessage", async () => {
      const vercelMessage = {
        id: "test-id",
        role: "user",
        content: "Hello from Vercel!",
        parts: [{ type: "text", text: "Hello from Vercel!" }],
        createdAt: new Date(),
        annotations: [],
      };

      await memory.add(vercelMessage);
      const messages = await memory.get();

      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: "user",
        content: "Hello from Vercel!",
      });
    });

    test("should add multiple messages in sequence", async () => {
      const message1: ChatMessage = { role: "user", content: "First message" };
      const message2: ChatMessage = {
        role: "assistant",
        content: "Second message",
      };

      await memory.add(message1);
      await memory.add(message2);

      const messages = await memory.get();
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual(message1);
      expect(messages[1]).toEqual(message2);
    });
  });

  describe("get", () => {
    beforeEach(async () => {
      // Add some test messages
      await memory.add({ role: "user", content: "User message" });
      await memory.add({ role: "assistant", content: "Assistant response" });
    });

    test("should return messages in LlamaIndex format by default", async () => {
      const messages = await memory.get();

      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({ role: "user", content: "User message" });
      expect(messages[1]).toEqual({
        role: "assistant",
        content: "Assistant response",
      });
    });

    test("should return messages in LlamaIndex format when explicitly requested", async () => {
      const messages = await memory.get({ type: "llamaindex" });

      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({ role: "user", content: "User message" });
      expect(messages[1]).toEqual({
        role: "assistant",
        content: "Assistant response",
      });
    });

    test("should add and get messages in LlamaIndex format when explicitly requested with options", async () => {
      const message = {
        role: "user",
        content: "Hello, world!",
        options: {
          temperature: 0.7,
          topP: 1.0,
        },
      };

      await memory.add(message);
      const messages = await memory.get({ type: "llamaindex" });

      expect(messages[messages.length - 1]).toEqual({
        role: "user",
        content: "Hello, world!",
        options: {
          temperature: 0.7,
          topP: 1.0,
        },
      });
    });

    test("should return messages in Vercel format when requested", async () => {
      const messages = await memory.get({ type: "vercel" });

      expect(messages).toHaveLength(2);
      expect(messages[0]).toMatchObject({
        role: "user",
        content: "User message",
        parts: [{ type: "text", text: "User message" }],
      });
      expect(messages[1]).toMatchObject({
        role: "assistant",
        content: "Assistant response",
        parts: [{ type: "text", text: "Assistant response" }],
      });

      // Check that IDs and timestamps are generated
      expect(typeof messages[0]).toBe("object");
      expect(messages[0]).toHaveProperty("id");
      expect(messages[0]).toHaveProperty("parts");
      expect(messages[0]?.parts).toHaveLength(1);
      expect(messages[1]).toHaveProperty("parts");
      expect(messages[1]?.parts).toHaveLength(1);
    });

    test("should include transient messages without storing them", async () => {
      const transientMessages: ChatMessage[] = [
        { role: "system", content: "Transient system message" },
        { role: "user", content: "Transient user message" },
      ];

      const messages = await memory.get({ transientMessages });

      // Should return stored messages + transient messages
      expect(messages).toHaveLength(4);
      expect(messages[0]).toEqual({ role: "user", content: "User message" });
      expect(messages[1]).toEqual({
        role: "assistant",
        content: "Assistant response",
      });
      expect(messages[2]).toEqual({
        role: "system",
        content: "Transient system message",
      });
      expect(messages[3]).toEqual({
        role: "user",
        content: "Transient user message",
      });

      // Verify transient messages are not stored permanently
      const storedMessages = await memory.get();
      expect(storedMessages).toHaveLength(2);
      expect(storedMessages[0]).toEqual({
        role: "user",
        content: "User message",
      });
      expect(storedMessages[1]).toEqual({
        role: "assistant",
        content: "Assistant response",
      });
    });
  });

  describe("getLLM", () => {
    beforeEach(async () => {
      // Add test messages with varying lengths
      await memory.add({ role: "user", content: "Short message 1" });
      await memory.add({
        role: "assistant",
        content:
          "This is a longer assistant response with more content to test token limits",
      });
      await memory.add({ role: "user", content: "Another user message" });
      await memory.add({
        role: "assistant",
        content: "Final assistant response",
      });
    });

    test("should return all messages when no LLM is provided", async () => {
      const messages = await memory.getLLM();

      expect(messages).toHaveLength(4);
      expect(messages[0]?.content).toBe("Short message 1");
      expect(messages[1]?.content).toBe(
        "This is a longer assistant response with more content to test token limits",
      );
      expect(messages[2]?.content).toBe("Another user message");
      expect(messages[3]?.content).toBe("Final assistant response");
    });

    test("should include transient messages in token calculation", async () => {
      const transientMessages: ChatMessage[] = [
        { role: "system", content: "System instruction" },
        { role: "user", content: "Transient user question" },
      ];

      const messages = await memory.getLLM(
        createMockLLM(500),
        transientMessages,
      );

      // Should include some combination of stored and transient messages
      expect(messages.length).toBeGreaterThan(0);

      // Check if transient messages are included (they should be recent)
      const messageContents = messages.map((m) => m.content);
      const hasTransientMessage = messageContents.some(
        (content) =>
          content === "System instruction" ||
          content === "Transient user question",
      );
      expect(hasTransientMessage).toBe(true);
    });

    test("should handle empty memory with transient messages", async () => {
      const emptyMemory = new Memory();
      const transientMessages: ChatMessage[] = [
        { role: "system", content: "System message" },
        { role: "user", content: "User question" },
      ];

      const messages = await emptyMemory.getLLM(
        createMockLLM(1000),
        transientMessages,
      );

      expect(messages).toHaveLength(2);
      expect(messages[0]?.content).toBe("System message");
      expect(messages[1]?.content).toBe("User question");
    });
  });

  describe("token limit handling", () => {
    beforeEach(async () => {
      // Add messages with different lengths for testing
      await memory.add({
        role: "assistant",
        content:
          "This is a medium length response that should take up more tokens than the previous message",
      });
      await memory.add({ role: "user", content: "Short" }); // has 2 tokens
      await memory.add({ role: "assistant", content: "Last message" }); // has 4 tokens
    });

    test("should return messages in token limit", async () => {
      const messages = await memory.getLLM(createMockLLM(1000));
      expect(messages).toHaveLength(3);
      expect(messages[0]?.content).toBe(
        "This is a medium length response that should take up more tokens than the previous message",
      );
      expect(messages[1]?.content).toBe("Short");
      expect(messages[2]?.content).toBe("Last message");
    });

    test("should only return messages that fit in the token limit", async () => {
      const messages = await memory.getLLM(createMockLLM(6));

      expect(messages).toHaveLength(2);
      expect(messages[0]?.content).toBe("Short");
      expect(messages[1]?.content).toBe("Last message");
    });
  });

  describe("clear", () => {
    test("should clear all messages", async () => {
      await memory.add({ role: "user", content: "Test message" });
      await memory.add({ role: "assistant", content: "Test response" });

      expect(await memory.get()).toHaveLength(2);

      await memory.clear();

      expect(await memory.get()).toHaveLength(0);
    });

    test("should allow adding messages after clearing", async () => {
      await memory.add({ role: "user", content: "First message" });
      await memory.clear();
      await memory.add({ role: "user", content: "After clear" });

      const messages = await memory.get();
      expect(messages).toHaveLength(1);
      expect(messages[0]?.content).toBe("After clear");
    });
  });

  describe("edge cases", () => {
    test("should handle message with empty content", async () => {
      await memory.add({ role: "user", content: "" });
      const messages = await memory.get();

      expect(messages).toHaveLength(1);
      expect(messages[0]?.content).toBe("");
    });

    test("should handle different role types", async () => {
      const roles: ChatMessage["role"][] = [
        "user",
        "assistant",
        "system",
        "memory",
        "developer",
      ];

      for (const role of roles) {
        await memory.add({ role, content: `Message from ${role}` });
      }

      const messages = await memory.get();
      expect(messages).toHaveLength(roles.length);

      roles.forEach((role, index) => {
        expect(messages[index]?.role).toBe(role);
        expect(messages[index]?.content).toBe(`Message from ${role}`);
      });
    });

    test("should handle Vercel message with data role", async () => {
      const vercelMessage = {
        id: "test-id",
        role: "data",
        content: "Data message",
        parts: [{ type: "text", text: "Data message" }],
        createdAt: new Date(),
        annotations: [],
      };

      await memory.add(vercelMessage);
      const messages = await memory.get();

      expect(messages[0]?.role).toBe("user"); // data role should be mapped to user
    });
  });
});
