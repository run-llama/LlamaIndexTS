import { MockLLM } from "@llamaindex/core/llms/mock";
import { describe, expect, it } from "vitest";

// TODO: add tests for tool calls
describe("BaseLLM exec", () => {
  it("should stream text response when no tool call is made", async () => {
    const responseMessage = "This is a response message while streaming";

    const llm = new MockLLM({ responseMessage });

    const { stream, newMessages, toolCalls } = await llm.exec({
      messages: [{ content: "Hi", role: "user" }],
      stream: true,
    });

    expect(() => newMessages()).toThrowError();

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.map((c) => c.delta).join("")).toBe(responseMessage);
    expect(toolCalls).toEqual([]);
    expect(newMessages()).toEqual([
      { content: responseMessage, role: "assistant" },
    ]);
  });
  it("should return text response when no tool call is made", async () => {
    const responseMessage = "This is a response message";

    const llm = new MockLLM({ responseMessage });

    const { newMessages, toolCalls } = await llm.exec({
      messages: [{ content: "Hi", role: "user" }],
    });

    expect(newMessages).toEqual([
      { content: responseMessage, role: "assistant" },
    ]);
    expect(toolCalls).toEqual([]);
  });
});
