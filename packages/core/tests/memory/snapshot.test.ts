import {
  createMemory,
  Memory,
  type MemoryMessage,
} from "@llamaindex/core/memory";
import { describe, expect, it } from "vitest";

describe("Memory Snapshot", () => {
  it("should create a snapshot of empty memory", () => {
    const memory = createMemory();
    const snapshot = memory.snapshot();
    const parsedSnapshot = JSON.parse(snapshot);

    expect(typeof snapshot).toBe("string");
    expect(parsedSnapshot).toEqual({
      messages: [],
      memoryCursor: 0,
    });
  });

  it("should create a snapshot with messages", async () => {
    const memory = createMemory();
    const message1: MemoryMessage = {
      id: "test-id",
      role: "user",
      content: "Hello",
    };
    const message2: MemoryMessage = {
      id: "test-id",
      role: "assistant",
      content: "Hi there!",
    };

    await memory.add(message1);
    await memory.add(message2);

    const snapshot = memory.snapshot();
    const parsedSnapshot = JSON.parse(snapshot);

    expect(typeof snapshot).toBe("string");
    expect(parsedSnapshot.messages).toHaveLength(2);
    expect(parsedSnapshot.messages[0].id).toBe(message1.id);
    expect(parsedSnapshot.messages[1].id).toBe(message2.id);
  });

  it("should load memory from snapshot", async () => {
    const originalMemory = createMemory();
    const message: MemoryMessage = {
      id: "test-id",
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
    const message1: MemoryMessage = {
      id: "test-id-1",
      role: "user",
      content: "First message",
    };
    const message2: MemoryMessage = {
      id: "test-id-2",
      role: "assistant",
      content: "Second message",
    };

    const snapshot = JSON.stringify({
      messages: [message1, message2],
    });

    const memory = Memory.loadMemory(snapshot);
    const messages = await memory.get();

    expect(messages).toHaveLength(2);
    expect(messages[0]?.content).toBe(message1.content);
    expect(messages[1]?.content).toBe(message2.content);

    const vercelMessages = await memory.get({ type: "vercel" });
    expect(vercelMessages).toHaveLength(2);
    expect(vercelMessages[0]?.id).toBe(message1.id);
    expect(vercelMessages[1]?.id).toBe(message2.id);
  });

  it("should create independent memory instances", async () => {
    const originalMemory = createMemory();
    const message: MemoryMessage = {
      id: "test-id",
      role: "user",
      content: "Original message",
    };

    await originalMemory.add(message);
    const snapshot = originalMemory.snapshot();

    const loadedMemory = Memory.loadMemory(snapshot);
    const newMessage: MemoryMessage = {
      id: "test-id-2",
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
