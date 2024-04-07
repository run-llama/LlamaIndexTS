import { faker } from "@faker-js/faker";
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
    if (params.stream) {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield {
            delta: faker.word.words(),
          } satisfies ChatResponseChunk;
        },
      };
    }
    return {
      message: {
        content: faker.lorem.paragraph(),
        role: "assistant",
      },
    } satisfies ChatResponse;
  }
  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(params: unknown): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
}
