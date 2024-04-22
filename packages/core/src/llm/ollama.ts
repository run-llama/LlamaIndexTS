import ollama, {
  type ChatResponse as OllamaChatResponse,
  type GenerateResponse as OllamaGenerateResponse,
} from "ollama";
import { BaseEmbedding } from "../embeddings/types.js";
import type {
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  LLM,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
} from "./types.js";
import { extractText, streamConverter } from "./utils.js";

const messageAccessor = (part: OllamaChatResponse): ChatResponseChunk => {
  return {
    raw: part,
    delta: part.message.content,
  };
};

const completionAccessor = (
  part: OllamaGenerateResponse,
): CompletionResponse => {
  return { text: part.response, raw: part };
};

/**
 * This class both implements the LLM and Embedding interfaces.
 */
export class Ollama extends BaseEmbedding implements LLM {
  readonly hasStreaming = true;

  // https://ollama.ai/library
  model: string;
  baseURL: string = "http://127.0.0.1:11434";
  temperature: number = 0.7;
  topP: number = 0.9;
  contextWindow: number = 4096;
  requestTimeout: number = 60 * 1000; // Default is 60 seconds
  additionalChatOptions?: Record<string, unknown>;

  protected modelMetadata: Partial<LLMMetadata>;

  constructor(
    init: Partial<Ollama> & {
      // model is required
      model: string;
      modelMetadata?: Partial<LLMMetadata>;
    },
  ) {
    super();
    this.model = init.model;
    this.modelMetadata = init.modelMetadata ?? {};
    Object.assign(this, init);
  }

  get metadata(): LLMMetadata {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: undefined,
      contextWindow: this.contextWindow,
      tokenizer: undefined,
      ...this.modelMetadata,
    };
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, stream } = params;
    const payload = {
      model: this.model,
      messages: messages.map((message) => ({
        role: message.role,
        content: extractText(message.content),
      })),
      stream: !!stream,
      options: {
        temperature: this.temperature,
        num_ctx: this.contextWindow,
        top_p: this.topP,
        ...this.additionalChatOptions,
      },
    };
    if (!stream) {
      const chatResponse = await ollama.chat({
        ...payload,
        stream: false,
      });

      return {
        message: {
          role: "assistant",
          content: chatResponse.message.content,
        },
        raw: chatResponse,
      };
    } else {
      const stream = await ollama.chat({
        ...payload,
        stream: true,
      });
      return streamConverter(stream, messageAccessor);
    }
  }

  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(
    params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse | AsyncIterable<CompletionResponse>> {
    const { prompt, stream } = params;
    const payload = {
      model: this.model,
      prompt: extractText(prompt),
      stream: !!stream,
      options: {
        temperature: this.temperature,
        num_ctx: this.contextWindow,
        top_p: this.topP,
        ...this.additionalChatOptions,
      },
    };
    if (!stream) {
      const response = await ollama.generate({
        ...payload,
        stream: false,
      });
      return {
        text: response.response,
        raw: response,
      };
    } else {
      const stream = await ollama.generate({
        ...payload,
        stream: true,
      });
      return streamConverter(stream, completionAccessor);
    }
  }

  private async getEmbedding(prompt: string): Promise<number[]> {
    const payload = {
      model: this.model,
      prompt,
      options: {
        temperature: this.temperature,
        num_ctx: this.contextWindow,
        top_p: this.topP,
        ...this.additionalChatOptions,
      },
    };
    const response = await ollama.embeddings({
      ...payload,
    });
    return response.embedding;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    return this.getEmbedding(text);
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getEmbedding(query);
  }
}
