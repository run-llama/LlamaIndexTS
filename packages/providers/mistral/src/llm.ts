import {
  BaseLLM,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
} from "@llamaindex/core/llms";
import { getEnv } from "@llamaindex/env";
import { type Mistral } from "@mistralai/mistralai";
import type { ContentChunk } from "@mistralai/mistralai/models/components";

export const ALL_AVAILABLE_MISTRAL_MODELS = {
  "mistral-tiny": { contextWindow: 32000 },
  "mistral-small": { contextWindow: 32000 },
  "mistral-medium": { contextWindow: 32000 },
};

export class MistralAISession {
  apiKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor(init?: { apiKey?: string | undefined }) {
    if (init?.apiKey) {
      this.apiKey = init?.apiKey;
    } else {
      this.apiKey = getEnv("MISTRAL_API_KEY")!;
    }
    if (!this.apiKey) {
      throw new Error("Set Mistral API key in MISTRAL_API_KEY env variable"); // Overriding MistralAI package's error message
    }
  }

  async getClient(): Promise<Mistral> {
    const { Mistral } = await import("@mistralai/mistralai");
    if (!this.client) {
      this.client = new Mistral({
        apiKey: this.apiKey,
      });
    }
    return this.client;
  }
}

/**
 * MistralAI LLM implementation
 */
export class MistralAI extends BaseLLM {
  // Per completion MistralAI params
  model: keyof typeof ALL_AVAILABLE_MISTRAL_MODELS;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  apiKey?: string;
  safeMode: boolean;
  randomSeed?: number | undefined;

  private session: MistralAISession;

  constructor(init?: Partial<MistralAI>) {
    super();
    this.model = init?.model ?? "mistral-small";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.safeMode = init?.safeMode ?? false;
    this.randomSeed = init?.randomSeed ?? undefined;
    this.session = new MistralAISession(init);
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: ALL_AVAILABLE_MISTRAL_MODELS[this.model].contextWindow,
      tokenizer: undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildParams(messages: ChatMessage[]): any {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      topP: this.topP,
      safeMode: this.safeMode,
      randomSeed: this.randomSeed,
      messages,
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
    // Streaming
    if (stream) {
      return this.streamChat(params);
    }
    // Non-streaming
    const client = await this.session.getClient();
    const response = await client.chat.complete(this.buildParams(messages));

    if (!response || !response.choices || !response.choices[0]) {
      throw new Error("Unexpected response format from Mistral API");
    }

    // Extract the content from the message response
    const content = response.choices[0].message.content;

    return {
      raw: response,
      message: {
        role: "assistant",
        content: this.extractContentAsString(content),
      },
    };
  }

  protected async *streamChat({
    messages,
  }: LLMChatParamsStreaming): AsyncIterable<ChatResponseChunk> {
    const client = await this.session.getClient();
    const chunkStream = await client.chat.stream(this.buildParams(messages));

    for await (const chunk of chunkStream) {
      if (!chunk.data || !chunk.data.choices || !chunk.data.choices.length)
        continue;

      const choice = chunk.data.choices[0];
      if (!choice) continue;

      yield {
        raw: chunk.data,
        delta: this.extractContentAsString(choice.delta.content),
      };
    }
  }

  private extractContentAsString(
    content: string | ContentChunk[] | null | undefined,
  ): string {
    if (Array.isArray(content)) {
      return content
        .map((chunk) => (chunk.type === "text" ? chunk.text : undefined))
        .filter(Boolean)
        .join("");
    }
    return content ?? "";
  }
}

/**
 * Convenience function to create a new MistralAI instance.
 * @param init - Optional initialization parameters for the MistralAI instance.
 * @returns A new MistralAI instance.
 */
export const mistral = (init?: ConstructorParameters<typeof MistralAI>[0]) =>
  new MistralAI(init);
