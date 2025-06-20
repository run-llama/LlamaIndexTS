import type { ChatMessage } from "@llamaindex/core/llms";
import { Memory } from "@llamaindex/core/memory";
import { describe, expect, it } from "vitest";

describe("Memory Snapshot", () => {
  it("should create a snapshot of empty memory", () => {
    const memory = new Memory();
    const snapshot = memory.snapshot();
    const parsedSnapshot = JSON.parse(snapshot);

    expect(typeof snapshot).toBe("string");
    expect(parsedSnapshot).toEqual({
      messages: [],
      tokenLimit: 4096,
    });
  });

  it("should create a snapshot with messages", async () => {
    const memory = new Memory();
    const message1: ChatMessage = {
      role: "user",
      content: "Hello",
    };
    const message2: ChatMessage = {
      role: "assistant",
      content: "Hi there!",
    };

    await memory.add(message1);
    await memory.add(message2);

    const snapshot = memory.snapshot();
    const parsedSnapshot = JSON.parse(snapshot);

    expect(typeof snapshot).toBe("string");
    expect(parsedSnapshot.messages).toHaveLength(2);
    expect(parsedSnapshot.messages[0]).toEqual(message1);
    expect(parsedSnapshot.messages[1]).toEqual(message2);
    expect(parsedSnapshot.tokenLimit).toBe(4096);
  });

  it("should load memory from snapshot", async () => {
    const originalMemory = new Memory();
    const message: ChatMessage = {
      role: "user",
      content: "Test message",
    };

    await originalMemory.add(message);
    const snapshot = originalMemory.snapshot();

    const loadedMemory = Memory.loadMemory(snapshot);
    const loadedSnapshot = JSON.parse(loadedMemory.snapshot());

    expect(loadedSnapshot).toEqual(JSON.parse(snapshot));
  });

  it("should load memory with correct messages", async () => {
    const message1: ChatMessage = {
      role: "user",
      content: "First message",
    };
    const message2: ChatMessage = {
      role: "assistant",
      content: "Second message",
    };

    const snapshot = JSON.stringify({
      messages: [message1, message2],
      tokenLimit: 4096,
    });

    const memory = Memory.loadMemory(snapshot);
    const messages = await memory.get();

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual(message1);
    expect(messages[1]).toEqual(message2);
  });

  it("should create independent memory instances", async () => {
    const originalMemory = new Memory();
    const message: ChatMessage = {
      role: "user",
      content: "Original message",
    };

    await originalMemory.add(message);
    const snapshot = originalMemory.snapshot();

    const loadedMemory = Memory.loadMemory(snapshot);
    const newMessage: ChatMessage = {
      role: "user",
      content: "New message",
    };

    await loadedMemory.add(newMessage);

    const originalMessages = await originalMemory.get();
    const loadedMessages = await loadedMemory.get();

    expect(originalMessages).toHaveLength(1);
    expect(loadedMessages).toHaveLength(2);
  });
});
