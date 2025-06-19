import type { ChatMessage } from "@llamaindex/core/llms";
import { Memory, type VercelMessage } from "@llamaindex/core/memory";
import { beforeEach, describe, expect, test } from "vitest";

describe("Memory", () => {
  let memory: Memory;

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
      const vercelMessage: VercelMessage = {
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
        options: undefined,
      });
    });

    test("should throw error for invalid message format", async () => {
      const invalidMessage = {
        invalidField: "test",
      };

      await expect(
        memory.add(invalidMessage as unknown as ChatMessage),
      ).rejects.toThrow(
        "Invalid message format. Expected ChatMessage or UIMessage.",
      );
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
      expect(typeof messages[0]?.id).toBe("string");
      expect(messages[0]?.createdAt).toBeInstanceOf(Date);
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

  describe("getMessagesWithLimit", () => {
    test("should respect custom token limit", async () => {
      await memory.add({ role: "user", content: "Message 1" });
      await memory.add({ role: "assistant", content: "Message 2" });
      await memory.add({ role: "user", content: "Message 3" });

      const messages = await memory.getMessagesWithLimit(20);

      // Should return messages that fit within the limit
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.length).toBeLessThanOrEqual(3);
    });

    test("should return empty array for empty memory", async () => {
      const messages = await memory.getMessagesWithLimit(100);
      expect(messages).toEqual([]);
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

  describe("token counting", () => {
    test("should handle empty messages", async () => {
      const messages = await memory.getMessagesWithLimit(100);
      expect(messages).toEqual([]);
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
      const vercelMessage: VercelMessage = {
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
