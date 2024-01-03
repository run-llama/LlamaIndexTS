import { ok } from "node:assert";
import { MessageContent } from "../ChatEngine";
import { CallbackManager, Event } from "../callbacks/CallbackManager";
import { BaseEmbedding } from "../embeddings";
import { ChatMessage, ChatResponse, LLM, LLMMetadata } from "./LLM";

const messageAccessor = (data: any) => data.message.content;
const completionAccessor = (data: any) => data.response;

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

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    messages: ChatMessage[],
    parentEvent?: Event | undefined,
    streaming?: T,
  ): Promise<R> {
    const payload = {
      model: this.model,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      stream: !!streaming,
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
    if (!streaming) {
      const raw = await response.json();
      const { message } = raw;
      return {
        message: {
          role: "assistant",
          content: message.content,
        },
        raw,
      } satisfies ChatResponse as R;
    } else {
      const stream = response.body;
      ok(stream, "stream is null");
      ok(stream instanceof ReadableStream, "stream is not readable");
      return this.streamChat(stream, messageAccessor, parentEvent) as R;
    }
  }

  private async *streamChat(
    stream: ReadableStream<Uint8Array>,
    accessor: (data: any) => string,
    parentEvent?: Event,
  ): AsyncGenerator<string, void, unknown> {
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

  async complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    prompt: MessageContent,
    parentEvent?: Event | undefined,
    streaming?: T | undefined,
  ): Promise<R> {
    const payload = {
      model: this.model,
      prompt: prompt,
      stream: !!streaming,
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
    if (!streaming) {
      const raw = await response.json();
      return {
        message: {
          role: "assistant",
          content: raw.response,
        },
        raw,
      } satisfies ChatResponse as R;
    } else {
      const stream = response.body;
      ok(stream, "stream is null");
      ok(stream instanceof ReadableStream, "stream is not readable");
      return this.streamChat(stream, completionAccessor, parentEvent) as R;
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
