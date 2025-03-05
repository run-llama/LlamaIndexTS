import type {
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  ToolCallLLM,
} from "@llamaindex/core/llms";
import type { JSONObject } from "llamaindex";
import { vi, type Mock } from "vitest";

/**
 * A simple mock implementation of ToolCallLLM for testing
 * Uses type assertion to bypass TypeScript's strict checks for testing purposes
 */
export const mockLLM: ToolCallLLM = {
  supportToolCall: true,
  metadata: {
    model: "mock-model",
    temperature: 0,
    topP: 1,
    contextWindow: 4096,
    tokenizer: undefined,
  },

  // Both streaming and non-streaming chat implementations
  chat: vi.fn() as unknown as ToolCallLLM["chat"],

  // Both streaming and non-streaming completion implementations
  complete: vi.fn() as unknown as ToolCallLLM["complete"],
};

/**
 * Configure mockLLM to respond with standard responses
 */
export function setupMockLLM() {
  // Reset mocks
  vi.resetAllMocks();

  // Setup chat implementation
  (mockLLM.chat as unknown as Mock).mockImplementation(
    (params: LLMChatParamsStreaming | LLMChatParamsNonStreaming) => {
      if (params.stream === true) {
        // Return streaming response
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            yield {
              delta: "Mock response",
              raw: null,
            };
          },
        });
      } else {
        // Return non-streaming response
        return Promise.resolve({
          message: {
            role: "assistant",
            content: "Mock response",
          },
          raw: null,
        });
      }
    },
  );

  // Setup complete implementation
  (mockLLM.complete as unknown as Mock).mockImplementation(
    (
      params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
    ) => {
      if (params.stream === true) {
        // Return streaming response
        return Promise.resolve({
          async *[Symbol.asyncIterator]() {
            yield {
              text: "Mock completion",
              raw: null,
            };
          },
        });
      } else {
        // Return non-streaming response
        return Promise.resolve({
          text: "Mock completion",
          raw: null,
        });
      }
    },
  );

  return mockLLM;
}

/**
 * Configure mockLLM to respond with regular tool calling responses.
 * This version will first return a tool call, then return a response without tool calls by checking the message history.
 */
export function setupToolCallingMockLLM(toolName: string, toolKwargs: unknown) {
  // Reset mocks
  vi.resetAllMocks();

  let hasCalledTool = false;

  // Setup chat implementation
  (mockLLM.chat as unknown as Mock).mockImplementation(
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
