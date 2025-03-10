// TODO: move to a test package
import { ToolCallLLM } from "../llms/base";
import type {
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
} from "../llms/type";

export class MockLLM extends ToolCallLLM {
  metadata: LLMMetadata;
  options: {
    timeBetweenToken: number;
    responseMessage: string;
  };
  supportToolCall: boolean = false;

  constructor(options?: {
    timeBetweenToken?: number;
    responseMessage?: string;
    metadata?: LLMMetadata;
  }) {
    super();
    this.options = {
      timeBetweenToken: options?.timeBetweenToken ?? 20,
      responseMessage: options?.responseMessage ?? "This is a mock response",
    };
    this.metadata = options?.metadata ?? {
      model: "MockLLM",
      temperature: 0.5,
      topP: 0.5,
      contextWindow: 1024,
      tokenizer: undefined,
    };
  }

  chat(
    params: LLMChatParamsStreaming<object, object>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<object, object>,
  ): Promise<ChatResponse<object>>;
  async chat(
    params:
      | LLMChatParamsStreaming<object, object>
      | LLMChatParamsNonStreaming<object, object>,
  ): Promise<AsyncIterable<ChatResponseChunk> | ChatResponse<object>> {
    const responseMessage = this.options.responseMessage;
    const timeBetweenToken = this.options.timeBetweenToken;

    if (params.stream) {
      return (async function* () {
        for (const char of responseMessage) {
          yield { delta: char, raw: {} };
          await new Promise((resolve) => setTimeout(resolve, timeBetweenToken));
        }
      })();
    }

    return {
      message: { content: responseMessage, role: "assistant" },
      raw: {},
    };
  }

  async complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  async complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(
    params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
  ): Promise<AsyncIterable<CompletionResponse> | CompletionResponse> {
    const responseMessage = this.options.responseMessage;
    const timeBetweenToken = this.options.timeBetweenToken;

    if (params.stream) {
      return (async function* () {
        for (const char of responseMessage) {
          yield { delta: char, text: char, raw: {} };
          await new Promise((resolve) => setTimeout(resolve, timeBetweenToken));
        }
      })();
    }

    return { text: responseMessage, raw: {} };
  }
}
