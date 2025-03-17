import type { ChatMessage } from "@llamaindex/core/llms";
import { setEnvs } from "@llamaindex/env";
import { beforeAll, describe, expect, test } from "vitest";
import { MistralAI } from "../src/index";

beforeAll(() => {
  setEnvs({
    MISTRAL_API_KEY: "valid",
  });
});

describe("Message Formatting", () => {
  describe("Basic Message Formatting", () => {
    test("Mistral formats basic messages correctly", () => {
      const mistral = new MistralAI();
      const inputMessages: ChatMessage[] = [
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ];
      const expectedOutput = [
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ];

      expect(mistral.formatMessages(inputMessages)).toEqual(expectedOutput);
    });

    test("Mistral handles multi-turn conversation correctly", () => {
      const mistral = new MistralAI();
      const inputMessages: ChatMessage[] = [
        { content: "Hi", role: "user" },
        { content: "Hello! How can I help?", role: "assistant" },
        { content: "What's the weather?", role: "user" },
      ];
      const expectedOutput = [
        { content: "Hi", role: "user" },
        { content: "Hello! How can I help?", role: "assistant" },
        { content: "What's the weather?", role: "user" },
      ];
      expect(mistral.formatMessages(inputMessages)).toEqual(expectedOutput);
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

    test("Mistral formats tool calls correctly", () => {
      const mistral = new MistralAI();
      const expectedOutput = [
        {
          role: "user",
          content: "What's the weather in London?",
        },
        {
          role: "assistant",
          content: "Let me check the weather.",
          toolCalls: [
            {
              type: "function",
              id: "call_123",
              function: {
                name: "weather",
                arguments: '{"location":"London"}',
              },
            },
          ],
        },
        {
          role: "tool",
          content: "The weather in London is sunny, +20°C",
          toolCallId: "call_123",
        },
      ];
      expect(mistral.formatMessages(toolCallMessages)).toEqual(expectedOutput);
    });
  });
});
