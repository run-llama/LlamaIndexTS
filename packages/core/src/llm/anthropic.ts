import AnthropicBase, {
  AI_PROMPT,
  ClientOptions,
  HUMAN_PROMPT,
} from "@anthropic-ai/sdk";
import _ from "lodash";
import {
  AnthropicStreamToken,
  CallbackManager,
  Event,
} from "../callbacks/CallbackManager";
import {
  ALL_AVAILABLE_ANTHROPIC_MODELS,
  BaseLLM,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
} from "./LLM";

export class AnthropicSession {
  anthropic: AnthropicBase;

  constructor(options: ClientOptions = {}) {
    if (!options.apiKey) {
      if (typeof process !== undefined) {
        options.apiKey = process.env.ANTHROPIC_API_KEY;
      }
    }

    if (!options.apiKey) {
      throw new Error("Set Anthropic Key in ANTHROPIC_API_KEY env variable"); // Overriding Anthropic package's error message
    }

    this.anthropic = new AnthropicBase(options);
  }
}

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
let defaultAnthropicSession: {
  session: AnthropicSession;
  options: ClientOptions;
}[] = [];

/**
 * Get a session for the Anthropic API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getAnthropicSession(options: ClientOptions = {}) {
  let session = defaultAnthropicSession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new AnthropicSession(options);
    defaultAnthropicSession.push({ session, options });
  }

  return session;
}

export const ANTHROPIC_HUMAN_PROMPT = HUMAN_PROMPT;
export const ANTHROPIC_AI_PROMPT = AI_PROMPT;

/**
 * Anthropic LLM implementation
 */

export class Anthropic extends BaseLLM {
  // Per completion Anthropic params
  model: keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS;
  temperature: number;
  topP: number;
  maxTokens?: number;

  // Anthropic session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: AnthropicSession;

  callbackManager?: CallbackManager;

  constructor(init?: Partial<Anthropic>) {
    super();
    this.model = init?.model ?? "claude-2";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 0.999; // Per Ben Mann
    this.maxTokens = init?.maxTokens ?? undefined;

    this.apiKey = init?.apiKey ?? undefined;
    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.session =
      init?.session ??
      getAnthropicSession({
        apiKey: this.apiKey,
        maxRetries: this.maxRetries,
        timeout: this.timeout,
      });

    this.callbackManager = init?.callbackManager;
  }

  tokens(messages: ChatMessage[]): number {
    throw new Error("Method not implemented.");
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: ALL_AVAILABLE_ANTHROPIC_MODELS[this.model].contextWindow,
      tokenizer: undefined,
    };
  }

  mapMessagesToPrompt(messages: ChatMessage[]) {
    return (
      messages.reduce((acc, message) => {
        return (
          acc +
          `${
            message.role === "system"
              ? ""
              : message.role === "assistant"
                ? ANTHROPIC_AI_PROMPT + " "
                : ANTHROPIC_HUMAN_PROMPT + " "
          }${message.content.trim()}`
        );
      }, "") + ANTHROPIC_AI_PROMPT
    );
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, parentEvent, stream } = params;
    //Streaming
    if (stream) {
      return this.streamChat(messages, parentEvent);
    }

    //Non-streaming
    const response = await this.session.anthropic.completions.create({
      model: this.model,
      prompt: this.mapMessagesToPrompt(messages),
      max_tokens_to_sample: this.maxTokens ?? 100000,
      temperature: this.temperature,
      top_p: this.topP,
    });

    return {
      message: { content: response.completion.trimStart(), role: "assistant" },
      //^ We're trimming the start because Anthropic often starts with a space in the response
      // That space will be re-added when we generate the next prompt.
    };
  }

  protected async *streamChat(
    messages: ChatMessage[],
    parentEvent?: Event | undefined,
  ): AsyncIterable<ChatResponseChunk> {
    // AsyncIterable<AnthropicStreamToken>
    const stream: AsyncIterable<AnthropicStreamToken> =
      await this.session.anthropic.completions.create({
        model: this.model,
        prompt: this.mapMessagesToPrompt(messages),
        max_tokens_to_sample: this.maxTokens ?? 100000,
        temperature: this.temperature,
        top_p: this.topP,
        stream: true,
      });

    var idx_counter: number = 0;
    for await (const part of stream) {
      //TODO: LLM Stream Callback, pending re-work.

      idx_counter++;
      yield { delta: part.completion };
    }
    return;
  }
}
