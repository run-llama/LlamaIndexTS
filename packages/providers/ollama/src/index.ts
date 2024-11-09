import { BaseEmbedding } from "@llamaindex/core/embeddings";
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
} from "@llamaindex/core/llms";
import { extractText, streamConverter } from "@llamaindex/core/utils";
import {
  Ollama as OllamaBase,
  type Config,
  type ChatResponse as OllamaChatResponse,
  type GenerateResponse as OllamaGenerateResponse,
  type Options,
} from "ollama/browser";

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

export type OllamaParams = {
  model: string;
  config?: Partial<Config>;
  options?: Partial<Options>;
};

export class Ollama extends BaseEmbedding implements LLM {
  public readonly ollama: OllamaBase;

  // https://ollama.ai/library
  model: string;

  options: Partial<Omit<Options, "num_ctx" | "top_p" | "temperature">> &
    Pick<Options, "num_ctx" | "top_p" | "temperature"> = {
    num_ctx: 4096,
    top_p: 0.9,
    temperature: 0.7,
  };

  constructor(params: OllamaParams) {
    super();
    this.model = params.model;
    this.ollama = new OllamaBase(params.config);
    if (params.options) {
      this.options = {
        ...this.options,
        ...params.options,
      };
    }
  }

  get metadata(): LLMMetadata {
    const { temperature, top_p, num_ctx } = this.options;
    return {
      model: this.model,
      temperature: temperature,
      topP: top_p,
      maxTokens: this.options.num_ctx,
      contextWindow: num_ctx,
      tokenizer: undefined,
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
        ...this.options,
      },
    };
    if (!stream) {
      const chatResponse = await this.ollama.chat({
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
      const stream = await this.ollama.chat({
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
        ...this.options,
      },
    };
    if (!stream) {
      const response = await this.ollama.generate({
        ...payload,
        stream: false,
      });
      return {
        text: response.response,
        raw: response,
      };
    } else {
      const stream = await this.ollama.generate({
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
        ...this.options,
      },
    };
    const response = await this.ollama.embeddings({
      ...payload,
    });
    return response.embedding;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    return this.getEmbedding(text);
  }
}
