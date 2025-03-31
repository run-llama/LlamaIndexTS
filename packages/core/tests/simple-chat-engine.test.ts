import { SimpleChatEngine } from "@llamaindex/core/chat-engine";
import { ChatMemoryBuffer } from "@llamaindex/core/memory";
import { MockLLM } from "@llamaindex/core/utils";
import { describe, expect, test } from "vitest";

describe("SimpleChatEngine", () => {
  test("constructor initializes with provided LLM", () => {
    const llm = new MockLLM();
    const engine = new SimpleChatEngine({ llm });
    expect(engine.llm).toBe(llm);
    expect(engine.memory).toBeInstanceOf(ChatMemoryBuffer);
    expect((engine.memory as ChatMemoryBuffer).tokenLimit).toBe(768);
  });
});
