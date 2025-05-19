import { type ChatMessage } from "@llamaindex/core/llms";
import { setEnvs } from "@llamaindex/env";
import { beforeAll, describe, expect, test } from "vitest";
import { OpenAI } from "../src/llm";

beforeAll(() => {
  setEnvs({
    ANTHROPIC_API_KEY: "valid",
  });
});

describe("Message Formatting", () => {
  describe("Basic Message Formatting", () => {
    test("OpenAI formats basic user and assistant messages correctly", () => {
      const inputMessages: ChatMessage[] = [
        { content: "Hello", role: "user" },
        { content: "Hi there!", role: "assistant" },
        { content: "Be helpful", role: "system" },
      ];
      const expectedOutput = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "system", content: "Be helpful" },
      ];
      expect(OpenAI.toOpenAIMessage(inputMessages)).toEqual(expectedOutput);
    });

    test("OpenAI handles system messages correctly", () => {
      const inputMessages: ChatMessage[] = [
        { content: "You are a coding assistant", role: "system" },
        { content: "Hello", role: "user" },
      ];
      const expectedOutput = [
        { role: "system", content: "You are a coding assistant" },
        { role: "user", content: "Hello" },
      ];
      expect(OpenAI.toOpenAIMessage(inputMessages)).toEqual(expectedOutput);
    });
  });

  describe("Tool Message Formatting", () => {
    const toolCallMessages: ChatMessage[] = [
      {
        role: "user",
        content: "What's the weather in London?",
      },
      {
        role: "assistant",
        content: "Let me check the weather.",
        options: {
          toolCall: [
            {
              id: "call_123",
              name: "weather",
              input: JSON.stringify({ location: "London" }),
            },
          ],
        },
      },
      {
        role: "assistant",
        content: "The weather in London is sunny, +20°C",
        options: {
          toolResult: {
            id: "call_123",
          },
        },
      },
    ];

    test("OpenAI formats tool calls correctly", () => {
      const expectedOutput = [
        {
          role: "user",
          content: "What's the weather in London?",
        },
        {
          role: "assistant",
          content: "Let me check the weather.",
          tool_calls: [
            {
              id: "call_123",
              type: "function",
              function: {
                name: "weather",
                arguments: JSON.stringify({ location: "London" }),
              },
            },
          ],
        },
        {
          role: "tool",
          content: "The weather in London is sunny, +20°C",
          tool_call_id: "call_123",
        },
      ];

      expect(OpenAI.toOpenAIMessage(toolCallMessages)).toEqual(expectedOutput);
    });

    test("OpenAI formats multiple tool calls correctly", () => {
      const multiToolMessages: ChatMessage[] = [
        {
          role: "assistant",
          content: "Let me check both weather and time.",
          options: {
            toolCall: [
              {
                id: "weather_123",
                name: "weather",
                input: JSON.stringify({ location: "London" }),
              },
              {
                id: "time_456",
                name: "time",
                input: JSON.stringify({ timezone: "GMT" }),
              },
            ],
          },
        },
      ];

      const expectedOutput = [
        {
          role: "assistant",
          content: "Let me check both weather and time.",
          tool_calls: [
            {
              id: "weather_123",
              type: "function",
              function: {
                name: "weather",
                arguments: JSON.stringify({ location: "London" }),
              },
            },
            {
              id: "time_456",
              type: "function",
              function: {
                name: "time",
                arguments: JSON.stringify({ timezone: "GMT" }),
              },
            },
          ],
        },
      ];

      expect(OpenAI.toOpenAIMessage(multiToolMessages)).toEqual(expectedOutput);
    });
  });
});
