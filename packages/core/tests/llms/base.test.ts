import { MockLLM } from "@llamaindex/core/utils";
import { describe, expect, it } from "vitest";

describe("BaseLLM exec", () => {
  it("should stream text response when no tool call is made", async () => {
    const responseMessage = "This is a response message while streaming";

    const llm = new MockLLM({ responseMessage });

    const stream = await llm.exec({
      messages: [{ content: "Hi", role: "user" }],
      stream: true,
    });

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.map((c) => c.delta).join("")).toBe(responseMessage);
  });
});
