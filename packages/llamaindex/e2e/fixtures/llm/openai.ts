import type {
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  LLM,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
} from "llamaindex/llm/types";
import { extractText } from "llamaindex/llm/utils";
import { deepStrictEqual, strictEqual } from "node:assert";
import { llmCompleteMockStorage } from "../../node/utils.js";

export function getOpenAISession() {
  return {};
}

export function isFunctionCallingModel() {
  return true;
}

export class OpenAI implements LLM {
  supportToolCall = true;
  get metadata() {
    return {
      model: "mock-model",
      temperature: 0.1,
      topP: 1,
      contextWindow: 2048,
      tokenizer: undefined,
      isFunctionCallingModel: true,
    };
  }
  chat(
    params: LLMChatParamsStreaming<Record<string, unknown>>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<Record<string, unknown>>,
  ): Promise<ChatResponse>;
  chat(
    params:
      | LLMChatParamsStreaming<Record<string, unknown>>
      | LLMChatParamsNonStreaming<Record<string, unknown>>,
  ): unknown {
    if (llmCompleteMockStorage.llmEventStart.length > 0) {
      const chatMessage =
        llmCompleteMockStorage.llmEventStart.shift()!["messages"];
      strictEqual(params.messages.length, chatMessage.length);
      for (let i = 0; i < chatMessage.length; i++) {
        strictEqual(params.messages[i].role, chatMessage[i].role);
        deepStrictEqual(params.messages[i].content, chatMessage[i].content);
      }

      if (llmCompleteMockStorage.llmEventEnd.length > 0) {
        const { id, response } = llmCompleteMockStorage.llmEventEnd.shift()!;
        if (params.stream) {
          return {
            [Symbol.asyncIterator]: async function* () {
              while (true) {
                const idx = llmCompleteMockStorage.llmEventStream.findIndex(
                  (e) => e.id === id,
                );
                if (idx === -1) {
                  break;
                }
                const chunk = llmCompleteMockStorage.llmEventStream[idx].chunk;
                llmCompleteMockStorage.llmEventStream.splice(idx, 1);
                yield chunk;
              }
            },
          };
        } else {
          return response;
        }
      }
    }
    throw new Error("Method not implemented.");
  }
  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(
    params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
  ): Promise<AsyncIterable<CompletionResponse> | CompletionResponse> {
    if (llmCompleteMockStorage.llmEventStart.length > 0) {
      const chatMessage =
        llmCompleteMockStorage.llmEventStart.shift()!["messages"];
      strictEqual(1, chatMessage.length);
      strictEqual("user", chatMessage[0].role);
      strictEqual(params.prompt, chatMessage[0].content);
    }
    if (llmCompleteMockStorage.llmEventEnd.length > 0) {
      const response = llmCompleteMockStorage.llmEventEnd.shift()!["response"];
      return {
        raw: response,
        text: extractText(response.message.content),
      } satisfies CompletionResponse;
    }
    throw new Error("Method not implemented.");
  }
}
