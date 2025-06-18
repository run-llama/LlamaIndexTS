import type { ChatMessage } from "@llamaindex/core/llms";
import type { UIMessage } from "@llamaindex/core/memory";
import { MessageConverter } from "@llamaindex/core/memory";
import { describe, expect, test } from "vitest";

describe("MessageConverter", () => {
  describe("toUIMessage", () => {
    test("converts simple ChatMessage to UIMessage", () => {
      const chatMessage: ChatMessage = {
        content: "Hello, how are you?",
        role: "user",
      };

      const uiMessage = MessageConverter.toUIMessage(chatMessage);

      expect(uiMessage).toHaveProperty("id");
      expect(uiMessage.role).toBe("user");
      expect(uiMessage.content).toBe("Hello, how are you?");
      expect(uiMessage).toHaveProperty("parts");
      expect(uiMessage.parts).toHaveLength(1);
    });

    test("generates unique IDs for each conversion", () => {
      const chatMessage: ChatMessage = {
        content: "Test message",
        role: "user",
      };

      const uiMessage1 = MessageConverter.toUIMessage(chatMessage);
      const uiMessage2 = MessageConverter.toUIMessage(chatMessage);

      expect(uiMessage1.id).not.toBe(uiMessage2.id);
    });
  });

  describe("toLlamaIndexMessage", () => {
    test("converts simple UIMessage to ChatMessage", () => {
      const uiMessage: UIMessage = {
        id: "msg-123",
        content: "Hello, how are you?",
        role: "user",
        parts: [],
      };

      const chatMessage = MessageConverter.toLlamaIndexMessage(uiMessage);

      expect(chatMessage.content).toBe("Hello, how are you?");
      expect(chatMessage.role).toBe("user");
    });
  });

  describe("type guards", () => {
    test("isChatMessage identifies valid ChatMessage", () => {
      const validChatMessage = {
        content: "Hello",
        role: "user",
      };

      expect(MessageConverter.isChatMessage(validChatMessage)).toBe(true);
    });

    test("isChatMessage rejects invalid objects", () => {
      const invalidObjects = [
        null,
        undefined,
        { content: "Hello" }, // missing role
        { role: "user" }, // missing content
      ];

      for (const obj of invalidObjects) {
        expect(MessageConverter.isChatMessage(obj)).toBe(false);
      }
    });

    test("isUIMessage identifies valid UIMessage", () => {
      const validUIMessage = {
        id: "msg-123",
        content: "Hello",
        role: "user",
        parts: [],
      };

      expect(MessageConverter.isUIMessage(validUIMessage)).toBe(true);
    });

    test("isUIMessage rejects invalid objects", () => {
      const invalidObjects = [
        null,
        undefined,
        { content: "Hello", role: "user" }, // missing id and parts
        { id: "123", role: "user" }, // missing content and parts
      ];

      for (const obj of invalidObjects) {
        expect(MessageConverter.isUIMessage(obj)).toBe(false);
      }
    });
  });
});
