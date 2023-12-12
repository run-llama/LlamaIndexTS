import {
  CallbackManager,
  Event,
  EventType,
  StreamCallbackResponse,
} from "../callbacks/CallbackManager";
import { ChatMessage, ChatResponse, LLM } from "./LLM";

export const ALL_AVAILABLE_MISTRAL_MODELS = {
  "mistral-tiny": { contextWindow: 4096 },
  "mistral-small": { contextWindow: 4096 },
  "mistral-medium": { contextWindow: 4096 },
};

/**
 * MistralAI LLM implementation
 */
export class MistralAI implements LLM {
  hasStreaming: boolean = true;

  // Per completion MistralAI params
  model: keyof typeof ALL_AVAILABLE_MISTRAL_MODELS;
  temperature: number;
  topP: number;
  maxTokens?: number;
  apiKey?: string;
  callbackManager?: CallbackManager;
  safeMode: boolean;
  randomSeed?: number;

  private client: any;

  constructor(init?: Partial<MistralAI>) {
    this.model = init?.model ?? "mistral-small";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.callbackManager = init?.callbackManager;
    this.safeMode = init?.safeMode ?? false;
    this.randomSeed = init?.randomSeed ?? undefined;
    if (init?.apiKey) {
      this.apiKey = init?.apiKey;
    } else {
      if (typeof process !== undefined) {
        this.apiKey = process.env.MISTRAL_API_KEY;
      }
    }
    if (!this.apiKey) {
      throw new Error("Set Mistral API key in MISTRAL_API_KEY env variable"); // Overriding MistralAI package's error message
    }
  }

  async getClient() {
    const { default: MistralClient } = await import("@mistralai/mistralai");
    if (!this.client) {
      this.client = new MistralClient(this.apiKey);
    }
    return this.client;
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

  tokens(messages: ChatMessage[]): number {
    throw new Error("Method not implemented.");
  }

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

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(messages: ChatMessage[], parentEvent?: Event, streaming?: T): Promise<R> {
    // Streaming
    if (streaming) {
      if (!this.hasStreaming) {
        throw Error("No streaming support for this LLM.");
      }
      return this.streamChat(messages, parentEvent) as R;
    }
    // Non-streaming
    const client = await this.getClient();
    const response = await client.chat(this.buildParams(messages));
    const message = response.choices[0].message;
    return {
      message,
    } as R;
  }

  async complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(prompt: string, parentEvent?: Event, streaming?: T): Promise<R> {
    return this.chat(
      [{ content: prompt, role: "user" }],
      parentEvent,
      streaming,
    );
  }

  protected async *streamChat(
    messages: ChatMessage[],
    parentEvent?: Event,
  ): AsyncGenerator<string, void, unknown> {
    //Now let's wrap our stream in a callback
    const onLLMStream = this.callbackManager?.onLLMStream
      ? this.callbackManager.onLLMStream
      : () => {};

    const client = await this.getClient();
    const chunkStream = await client.chatStream(this.buildParams(messages));

    const event: Event = parentEvent
      ? parentEvent
      : {
          id: "unspecified",
          type: "llmPredict" as EventType,
        };

    //Indices
    var idx_counter: number = 0;
    for await (const part of chunkStream) {
      if (!part.choices.length) continue;

      part.choices[0].index = idx_counter;
      const isDone: boolean =
        part.choices[0].finish_reason === "stop" ? true : false;

      const stream_callback: StreamCallbackResponse = {
        event: event,
        index: idx_counter,
        isDone: isDone,
        token: part,
      };
      onLLMStream(stream_callback);

      idx_counter++;

      yield part.choices[0].delta.content ?? "";
    }
    return;
  }

  //streamComplete doesn't need to be async because it's child function is already async
  protected streamComplete(
    query: string,
    parentEvent?: Event,
  ): AsyncGenerator<string, void, unknown> {
    return this.streamChat([{ content: query, role: "user" }], parentEvent);
  }
}
