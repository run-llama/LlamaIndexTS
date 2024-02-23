import { ok } from "@llamaindex/env";
import { CallbackManager, Event } from "../callbacks/CallbackManager.js";
import { BaseEmbedding } from "../embeddings/types.js";
import {
  ChatMessage,
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

const messageAccessor = (data: any): ChatResponseChunk => {
  return {
    delta: data.message.content,
  };
};
const completionAccessor = (data: any): CompletionResponse => {
  return { text: data.response };
};

// https://github.com/jmorganca/ollama
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
  callbackManager?: CallbackManager;

  constructor(
    init: Partial<Ollama> & {
      // model is required
      model: string;
    },
  ) {
    super();
    this.model = init.model;
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
    };
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, parentEvent, stream } = params;
    const payload = {
      model: this.model,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      stream: !!stream,
      options: {
        temperature: this.temperature,
        num_ctx: this.contextWindow,
        top_p: this.topP,
        ...this.additionalChatOptions,
      },
    };
    const response = await fetch(`${this.baseURL}/api/chat`, {
      body: JSON.stringify(payload),
      method: "POST",
      signal: AbortSignal.timeout(this.requestTimeout),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!stream) {
      const raw = await response.json();
      const { message } = raw;
      return {
        message: {
          role: "assistant",
          content: message.content,
        },
        raw,
      };
    } else {
      const stream = response.body;
      ok(stream, "stream is null");
      ok(stream instanceof ReadableStream, "stream is not readable");
      return this.streamChat(stream, messageAccessor, parentEvent);
    }
  }

  private async *streamChat<T>(
    stream: ReadableStream<Uint8Array>,
    accessor: (data: any) => T,
    parentEvent?: Event,
  ): AsyncIterable<T> {
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      const lines = Buffer.from(value)
        .toString("utf-8")
        .split("\n")
        .map((line) => line.trim());
      for (const line of lines) {
        if (line === "") {
          continue;
        }
        const json = JSON.parse(line);
        if (json.error) {
          throw new Error(json.error);
        }
        yield accessor(json);
      }
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
    const { prompt, parentEvent, stream } = params;
    const payload = {
      model: this.model,
      prompt: prompt,
      stream: !!stream,
      options: {
        temperature: this.temperature,
        num_ctx: this.contextWindow,
        top_p: this.topP,
        ...this.additionalChatOptions,
      },
    };
    const response = await fetch(`${this.baseURL}/api/generate`, {
      body: JSON.stringify(payload),
      method: "POST",
      signal: AbortSignal.timeout(this.requestTimeout),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!stream) {
      const raw = await response.json();
      return {
        text: raw.response,
        raw,
      };
    } else {
      const stream = response.body;
      ok(stream, "stream is null");
      ok(stream instanceof ReadableStream, "stream is not readable");
      return this.streamChat(stream, completionAccessor, parentEvent);
    }
  }

  tokens(messages: ChatMessage[]): number {
    throw new Error("Method not implemented.");
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
    const response = await fetch(`${this.baseURL}/api/embeddings`, {
      body: JSON.stringify(payload),
      method: "POST",
      signal: AbortSignal.timeout(this.requestTimeout),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { embedding } = await response.json();
    return embedding;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    return this.getEmbedding(text);
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getEmbedding(query);
  }
}
