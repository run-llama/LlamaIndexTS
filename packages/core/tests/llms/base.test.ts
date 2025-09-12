import { MockLLM } from "@llamaindex/core/llms/mock";
import { tool } from "@llamaindex/core/tools";
import { describe, expect, it } from "vitest";
import { z } from "zod/v3";

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

  it("should handle tool calls with weather tool", async () => {
    const weatherTool = tool({
      name: "get_weather",
      description: "Get the current weather for a location",
      parameters: z.object({
        address: z.string().describe("The address"),
      }),
      execute: ({ address }) => {
        return `It's sunny in ${address}!`;
      },
    });

    const mockToolCallInput = { address: "San Francisco" };
    const expectedWeatherResult = "It's sunny in San Francisco!";

    const llm = new MockLLM({
      mockToolCallResponse: {
        toolCalls: [
          {
            id: "weather-tool-call-id",
            name: "get_weather",
            input: mockToolCallInput,
          },
        ],
        responseMessage: "",
      },
    });

    const { newMessages, toolCalls } = await llm.exec({
      messages: [
        { content: "What's the weather in San Francisco?", role: "user" },
      ],
      tools: [weatherTool],
    });

    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0]!.name).toBe("get_weather");
    expect(toolCalls[0]!.input).toEqual(mockToolCallInput);
    expect(newMessages).toHaveLength(2); // assistant message + tool result message

    // Check that the tool was executed and result is in the tool result message
    const toolResultMessage = newMessages[1];
    expect(toolResultMessage!.content).toBe(expectedWeatherResult);
    expect(toolResultMessage!.role).toBe("user");
    expect(toolResultMessage!.options).toHaveProperty("toolResult");
  });

  it("should return structured output with responseFormat", async () => {
    const schema = z.object({
      title: z.string(),
      author: z.string(),
      year: z.number(),
    });

    const mockObject = {
      title: "La Divina Commedia",
      author: "Dante Alighieri",
      year: 1321,
    };

    const llm = new MockLLM({
      mockToolCallResponse: {
        toolCalls: [
          {
            id: "test-tool-call-id",
            name: "format_output",
            input: mockObject,
          },
        ],
        responseMessage: "",
      },
    });

    const { newMessages, toolCalls, object } = await llm.exec({
      messages: [{ content: "Extract book info", role: "user" }],
      responseFormat: schema,
    });

    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0]!.name).toBe("format_output");
    expect(object).toBeDefined();
    expect(object).toEqual(mockObject);
    expect(newMessages).toHaveLength(2); // assistant message + tool result message
  });
});
