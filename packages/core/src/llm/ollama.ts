import { BaseEmbedding } from "../embeddings/types.js";
import {
  Ollama as OllamaBase,
  type Config,
  type CopyRequest,
  type CreateRequest,
  type DeleteRequest,
  type EmbeddingsRequest,
  type EmbeddingsResponse,
  type GenerateRequest,
  type ListResponse,
  type ChatResponse as OllamaChatResponse,
  type GenerateResponse as OllamaGenerateResponse,
  type Options,
  type ProgressResponse,
  type PullRequest,
  type PushRequest,
  type ShowRequest,
  type ShowResponse,
  type StatusResponse,
} from "../internal/deps/ollama.js";
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
  config?: Partial<Config>;
  options?: Partial<Options>;
};

/**
 * This class both implements the LLM and Embedding interfaces.
 */
export class Ollama
  extends BaseEmbedding
  implements LLM, Omit<OllamaBase, "chat">
{
  readonly hasStreaming = true;

  ollama: OllamaBase;

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

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getEmbedding(query);
  }

  // Inherited from OllamaBase

  push(
    request: PushRequest & { stream: true },
  ): Promise<AsyncGenerator<ProgressResponse, any, unknown>>;
  push(
    request: PushRequest & { stream?: false | undefined },
  ): Promise<ProgressResponse>;
  push(request: any): any {
    return this.ollama.push(request);
  }
  abort(): void {
    return this.ollama.abort();
  }
  encodeImage(image: string | Uint8Array): Promise<string> {
    return this.ollama.encodeImage(image);
  }
  generate(
    request: GenerateRequest & { stream: true },
  ): Promise<AsyncGenerator<OllamaGenerateResponse>>;
  generate(
    request: GenerateRequest & { stream?: false | undefined },
  ): Promise<OllamaGenerateResponse>;
  generate(request: any): any {
    return this.ollama.generate(request);
  }
  create(
    request: CreateRequest & { stream: true },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  create(
    request: CreateRequest & { stream?: false | undefined },
  ): Promise<ProgressResponse>;
  create(request: any): any {
    return this.ollama.create(request);
  }
  pull(
    request: PullRequest & { stream: true },
  ): Promise<AsyncGenerator<ProgressResponse>>;
  pull(
    request: PullRequest & { stream?: false | undefined },
  ): Promise<ProgressResponse>;
  pull(request: any): any {
    return this.ollama.pull(request);
  }
  delete(request: DeleteRequest): Promise<StatusResponse> {
    return this.ollama.delete(request);
  }
  copy(request: CopyRequest): Promise<StatusResponse> {
    return this.ollama.copy(request);
  }
  list(): Promise<ListResponse> {
    return this.ollama.list();
  }
  show(request: ShowRequest): Promise<ShowResponse> {
    return this.ollama.show(request);
  }
  embeddings(request: EmbeddingsRequest): Promise<EmbeddingsResponse> {
    return this.ollama.embeddings(request);
  }
}
