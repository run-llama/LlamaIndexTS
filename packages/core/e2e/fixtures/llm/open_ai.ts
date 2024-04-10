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
import { strictEqual } from "node:assert";
import { llmCompleteMockStorage } from "../../node/utils.js";

export function getOpenAISession() {
  return {};
}

export function isFunctionCallingModel() {
  return true;
}

export class OpenAI implements LLM {
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
      strictEqual(chatMessage.length, params.messages.length);
      for (let i = 0; i < chatMessage.length; i++) {
        strictEqual(chatMessage[i].role, params.messages[i].role);
        strictEqual(chatMessage[i].content, params.messages[i].content);
      }

      if (llmCompleteMockStorage.llmEventEnd.length > 0) {
        const response =
          llmCompleteMockStorage.llmEventEnd.shift()!["response"];
        if (params.stream) {
          const content = response.message.content as string;
          // maybe this is not the correct way to split the content, but it's good enough for now
          const tokens = content.split("");
          return {
            [Symbol.asyncIterator]: async function* () {
              const delta = tokens.shift();
              if (delta) {
                yield {
                  delta,
                } as ChatResponseChunk;
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
      strictEqual(chatMessage.length, 1);
      strictEqual(chatMessage[0].role, "user");
      strictEqual(chatMessage[0].content, params.prompt);
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
