import { Settings } from "@llamaindex/core/global";
import type { ChatMessage } from "@llamaindex/core/llms";
import { ChatMemoryBuffer } from "@llamaindex/core/memory";
import { beforeEach, describe, expect, test } from "vitest";

describe("ChatMemoryBuffer", () => {
  beforeEach(() => {
    // Mock the Settings.llm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Settings.llm as any) = {
      metadata: {
        contextWindow: 1000,
      },
    };
  });

  test("constructor initializes with custom token limit", () => {
    const buffer = new ChatMemoryBuffer({ tokenLimit: 500 });
    expect(buffer.tokenLimit).toBe(500);
  });

  test("getMessages returns all messages when under token limit", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
      { role: "user", content: "How are you?" },
    ];
    const buffer = new ChatMemoryBuffer({
      tokenLimit: 1000,
      chatHistory: messages,
    });

    const result = buffer.getMessages();
    expect(result).toEqual(messages);
  });

  test("getMessages truncates messages when over token limit", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "This is a long message" },
      { role: "assistant", content: "This is also a long reply" },
      { role: "user", content: "Short" },
    ];
    const buffer = new ChatMemoryBuffer({
      tokenLimit: 5, // limit to only allow the last message
      chatHistory: messages,
    });

    const result = buffer.getMessages();
    expect(result).toEqual([{ role: "user", content: "Short" }]);
  });

  test("getMessages handles input messages", () => {
    const storedMessages: ChatMessage[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];
    const buffer = new ChatMemoryBuffer({
      tokenLimit: 50,
      chatHistory: storedMessages,
    });

    const inputMessages: ChatMessage[] = [
      { role: "user", content: "New message" },
    ];
    const result = buffer.getMessages(inputMessages);
    expect(result).toEqual([...inputMessages, ...storedMessages]);
  });

  test("getMessages throws error when initial token count exceeds limit", () => {
    const buffer = new ChatMemoryBuffer({ tokenLimit: 10 });
    expect(async () => await buffer.getMessages(undefined, 20)).toThrow(
      "Initial token count exceeds token limit",
    );
  });
});
