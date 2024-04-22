import ollama, {
  type CreateRequest,
  type ChatResponse as OllamaChatResponse,
  type GenerateResponse as OllamaGenerateResponse,
  type Options,
  type ProgressResponse,
  type ShowRequest,
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

export type OllamaParams = {
  model: string;
  options?: Partial<Options>;
};

/**
 * This class both implements the LLM and Embedding interfaces.
 */
export class Ollama extends BaseEmbedding implements LLM {
  readonly hasStreaming = true;

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
      maxTokens: undefined,
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
        ...this.options,
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
        ...this.options,
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

  // ollama specific methods, inherited from the ollama library
  static async list() {
    const { models } = await ollama.list();
    return models;
  }

  static async detail(modelName: string, options?: Omit<ShowRequest, "model">) {
    return ollama.show({
      model: modelName,
      ...options,
    });
  }

  static async create(
    modelName: string,
    options?: Omit<CreateRequest, "model"> & {
      stream: false;
    },
  ): Promise<ProgressResponse>;
  static async create(
    modelName: string,
    options: Omit<CreateRequest, "model"> & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  static async create(
    modelName: string,
    options?: Omit<CreateRequest, "model"> & {
      stream: boolean;
    },
  ) {
    return ollama.create({
      model: modelName,
      ...options,
      stream: (options ? !!options.stream : false) as never,
    }) as Promise<ProgressResponse> | Promise<AsyncGenerator<ProgressResponse>>;
  }

  static async delete(modelName: string) {
    return ollama.delete({
      model: modelName,
    });
  }

  static async copy(source: string, destination: string) {
    return ollama.copy({
      source,
      destination,
    });
  }

  static async pull(
    modelName: string,
    options?: Omit<CreateRequest, "model"> & {
      stream: false;
    },
  ): Promise<ProgressResponse>;
  static async pull(
    modelName: string,
    options: Omit<CreateRequest, "model"> & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  static async pull(
    modelName: string,
    options?: Omit<CreateRequest, "model"> & {
      stream: boolean;
    },
  ) {
    return ollama.pull({
      model: modelName,
      ...options,
      stream: (options ? !!options.stream : false) as never,
    }) as Promise<ProgressResponse> | Promise<AsyncGenerator<ProgressResponse>>;
  }

  static async push(
    modelName: string,
    options?: Omit<CreateRequest, "model"> & {
      stream: false;
    },
  ): Promise<ProgressResponse>;
  static async push(
    modelName: string,
    options: Omit<CreateRequest, "model"> & {
      stream: true;
    },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  static async push(
    modelName: string,
    options?: Omit<CreateRequest, "model"> & {
      stream: boolean;
    },
  ) {
    return ollama.push({
      model: modelName,
      ...options,
      stream: (options ? !!options.stream : false) as never,
    }) as Promise<ProgressResponse> | Promise<AsyncGenerator<ProgressResponse>>;
  }
}
