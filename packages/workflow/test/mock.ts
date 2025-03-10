import { JSONObject } from "@llamaindex/core/global";
import {
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  ToolCallLLM,
} from "@llamaindex/core/llms";
import { MockLLM } from "@llamaindex/core/utils";
import { vi } from "vitest";

/**
 * Configure a mock LLM to respond with tool calling responses.
 * This version will first return a tool call, then return a response without tool calls by checking the message history.
 */
export function setupToolCallingMockLLM(
  toolName: string,
  toolKwargs: unknown,
): ToolCallLLM {
  // Reset mocks
  vi.resetAllMocks();

  const mockLLM = new MockLLM({
    responseMessage: "I'll help with that.",
    metadata: {
      model: "mock-model",
      temperature: 0,
      topP: 1,
      contextWindow: 4096,
      tokenizer: undefined,
    },
  });
  mockLLM.supportToolCall = true;

  let hasCalledTool = false;

  // Override the chat method with our custom implementation
  mockLLM.chat = vi
    .fn()
    .mockImplementation(
      (params: LLMChatParamsStreaming | LLMChatParamsNonStreaming) => {
        // Track if we've already returned a tool call response
        // If we have tool results in the message history, we're in the second round
        const hasToolResult = params.messages.some(
          (msg) =>
            msg.options &&
            typeof msg.options === "object" &&
            "toolResult" in msg.options,
        );

        if (hasToolResult || hasCalledTool) {
          // Second response - just return a normal message without tool calls
          hasCalledTool = false; // Reset for next run

          if (params.stream === true) {
            return Promise.resolve({
              async *[Symbol.asyncIterator]() {
                yield {
                  delta: "Final response",
                  raw: {},
                };
              },
            });
          } else {
            return Promise.resolve({
              message: {
                role: "assistant",
                content: "Final response",
              },
              raw: {},
            });
          }
        } else {
          // First response - return a tool call
          hasCalledTool = true;

          if (params.stream === true) {
            return Promise.resolve({
              async *[Symbol.asyncIterator]() {
                yield {
                  delta: "I'll help with that.",
                  raw: {},
                  options: {
                    toolCall: [
                      {
                        id: "call_123",
                        name: toolName,
                        input: toolKwargs as JSONObject,
                      },
                    ],
                  },
                };
              },
            });
          } else {
            return Promise.resolve({
              message: {
                role: "assistant",
                content: "I'll help with that.",
                options: {
                  toolCall: [
                    {
                      id: "call_123",
                      name: toolName,
                      input: toolKwargs as JSONObject,
                    },
                  ],
                },
              },
              raw: {},
            });
          }
        }
      },
    );

  return mockLLM;
}
