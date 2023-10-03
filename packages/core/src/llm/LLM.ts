import OpenAILLM, { ClientOptions as OpenAIClientOptions } from "openai";
import {
  AnthropicStreamToken,
  CallbackManager,
  Event,
  EventType,
  OpenAIStreamToken,
  StreamCallbackResponse,
} from "../callbacks/CallbackManager";

import { LLMOptions } from "portkey-ai";
import {
  AnthropicSession,
  ANTHROPIC_AI_PROMPT,
  ANTHROPIC_HUMAN_PROMPT,
  getAnthropicSession,
} from "./anthropic";
import {
  AzureOpenAIConfig,
  getAzureBaseUrl,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure";
import { getOpenAISession, OpenAISession } from "./openai";
import { PortkeySession, getPortkeySession } from "./portkey";
import { ReplicateSession } from "./replicate";

export type MessageType =
  | "user"
  | "assistant"
  | "system"
  | "generic"
  | "function";

export interface ChatMessage {
  content: string;
  role: MessageType;
}

export interface ChatResponse {
  message: ChatMessage;
  raw?: Record<string, any>;
  delta?: string;
}

// NOTE in case we need CompletionResponse to diverge from ChatResponse in the future
export type CompletionResponse = ChatResponse;

/**
 * Unified language model interface
 */
export interface LLM {
  //Whether a LLM has streaming support
  hasStreaming: boolean;
  /**
   * Get a chat response from the LLM
   * @param messages
   *
   * The return type of chat() and complete() are set by the "streaming" parameter being set to True.
   */
  chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    messages: ChatMessage[],
    parentEvent?: Event,
    streaming?: T,
  ): Promise<R>;

  /**
   * Get a prompt completion from the LLM
   * @param prompt the prompt to complete
   */
  complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    prompt: string,
    parentEvent?: Event,
    streaming?: T,
  ): Promise<R>;
}

export const GPT4_MODELS = {
  "gpt-4": { contextWindow: 8192 },
  "gpt-4-32k": { contextWindow: 32768 },
};

export const TURBO_MODELS = {
  "gpt-3.5-turbo": { contextWindow: 4096 },
  "gpt-3.5-turbo-16k": { contextWindow: 16384 },
};

/**
 * We currently support GPT-3.5 and GPT-4 models
 */
export const ALL_AVAILABLE_OPENAI_MODELS = {
  ...GPT4_MODELS,
  ...TURBO_MODELS,
};

/**
 * OpenAI LLM implementation
 */
export class OpenAI implements LLM {
  // Per completion OpenAI params
  model: keyof typeof ALL_AVAILABLE_OPENAI_MODELS;
  temperature: number;
  topP: number;
  maxTokens?: number;
  additionalChatOptions?: Omit<
    Partial<OpenAILLM.Chat.CompletionCreateParams>,
    "max_tokens" | "messages" | "model" | "temperature" | "top_p" | "streaming"
  >;
  hasStreaming: boolean;

  // OpenAI session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: OpenAISession;
  additionalSessionOptions?: Omit<
    Partial<OpenAIClientOptions>,
    "apiKey" | "maxRetries" | "timeout"
  >;

  callbackManager?: CallbackManager;

  constructor(
    init?: Partial<OpenAI> & {
      azure?: AzureOpenAIConfig;
    },
  ) {
    this.model = init?.model ?? "gpt-3.5-turbo";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalChatOptions = init?.additionalChatOptions;
    this.additionalSessionOptions = init?.additionalSessionOptions;
    this.hasStreaming = init?.hasStreaming ?? true;

    if (init?.azure || shouldUseAzure()) {
      const azureConfig = getAzureConfigFromEnv({
        ...init?.azure,
        model: getAzureModel(this.model),
      });

      if (!azureConfig.apiKey) {
        throw new Error(
          "Azure API key is required for OpenAI Azure models. Please set the AZURE_OPENAI_KEY environment variable.",
        );
      }

      this.apiKey = azureConfig.apiKey;
      this.session =
        init?.session ??
        getOpenAISession({
          azure: true,
          apiKey: this.apiKey,
          baseURL: getAzureBaseUrl(azureConfig),
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          defaultQuery: { "api-version": azureConfig.apiVersion },
          ...this.additionalSessionOptions,
        });
    } else {
      this.apiKey = init?.apiKey ?? undefined;
      this.session =
        init?.session ??
        getOpenAISession({
          apiKey: this.apiKey,
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          ...this.additionalSessionOptions,
        });
    }

    this.callbackManager = init?.callbackManager;
  }

  mapMessageType(
    messageType: MessageType,
  ): "user" | "assistant" | "system" | "function" {
    switch (messageType) {
      case "user":
        return "user";
      case "assistant":
        return "assistant";
      case "system":
        return "system";
      case "function":
        return "function";
      default:
        return "user";
    }
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(messages: ChatMessage[], parentEvent?: Event, streaming?: T): Promise<R> {
    const baseRequestParams: OpenAILLM.Chat.CompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: messages.map((message) => ({
        role: this.mapMessageType(message.role),
        content: message.content,
      })),
      top_p: this.topP,
      ...this.additionalChatOptions,
    };
    // Streaming
    if (streaming) {
      if (!this.hasStreaming) {
        throw Error("No streaming support for this LLM.");
      }
      return this.streamChat(messages, parentEvent) as R;
    }
    // Non-streaming
    const response = await this.session.openai.chat.completions.create({
      ...baseRequestParams,
      stream: false,
    });

    const content = response.choices[0].message?.content ?? "";
    return {
      message: { content, role: response.choices[0].message.role },
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

  //We can wrap a stream in a generator to add some additional logging behavior
  //For future edits: syntax for generator type is <typeof Yield, typeof Return, typeof Accept>
  //"typeof Accept" refers to what types you'll accept when you manually call generator.next(<AcceptType>)
  protected async *streamChat(
    messages: ChatMessage[],
    parentEvent?: Event,
  ): AsyncGenerator<string, void, unknown> {
    const baseRequestParams: OpenAILLM.Chat.CompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: messages.map((message) => ({
        role: this.mapMessageType(message.role),
        content: message.content,
      })),
      top_p: this.topP,
      ...this.additionalChatOptions,
    };

    //Now let's wrap our stream in a callback
    const onLLMStream = this.callbackManager?.onLLMStream
      ? this.callbackManager.onLLMStream
      : () => {};

    const chunk_stream: AsyncIterable<OpenAIStreamToken> =
      await this.session.openai.chat.completions.create({
        ...baseRequestParams,
        stream: true,
      });

    const event: Event = parentEvent
      ? parentEvent
      : {
          id: "unspecified",
          type: "llmPredict" as EventType,
        };

    //Indices
    var idx_counter: number = 0;
    for await (const part of chunk_stream) {
      //Increment
      part.choices[0].index = idx_counter;
      const is_done: boolean =
        part.choices[0].finish_reason === "stop" ? true : false;
      //onLLMStream Callback

      const stream_callback: StreamCallbackResponse = {
        event: event,
        index: idx_counter,
        isDone: is_done,
        token: part,
      };
      onLLMStream(stream_callback);

      idx_counter++;

      yield part.choices[0].delta.content ? part.choices[0].delta.content : "";
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

export const ALL_AVAILABLE_LLAMADEUCE_MODELS = {
  "Llama-2-70b-chat-old": {
    contextWindow: 4096,
    replicateApi:
      "replicate/llama70b-v2-chat:e951f18578850b652510200860fc4ea62b3b16fac280f83ff32282f87bbd2e48",
    //^ Previous 70b model. This is also actually 4 bit, although not exllama.
  },
  "Llama-2-70b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "replicate/llama70b-v2-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
    //^ Model is based off of exllama 4bit.
  },
  "Llama-2-13b-chat": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
  },
  //^ Last known good 13b non-quantized model. In future versions they add the SYS and INST tags themselves
  "Llama-2-13b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama13b-v2-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52",
  },
  "Llama-2-7b-chat": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama7b-v2-chat:4f0a4744c7295c024a1de15e1a63c880d3da035fa1f49bfd344fe076074c8eea",
    //^ Last (somewhat) known good 7b non-quantized model. In future versions they add the SYS and INST
    // tags themselves
    // https://github.com/replicate/cog-llama-template/commit/fa5ce83912cf82fc2b9c01a4e9dc9bff6f2ef137
    // Problem is that they fix the max_new_tokens issue in the same commit. :-(
  },
  "Llama-2-7b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama7b-v2-chat:4f0b260b6a13eb53a6b1891f089d57c08f41003ae79458be5011303d81a394dc",
  },
};

export enum DeuceChatStrategy {
  A16Z = "a16z",
  META = "meta",
  METAWBOS = "metawbos",
  //^ This is not exactly right because SentencePiece puts the BOS and EOS token IDs in after tokenization
  // Unfortunately any string only API won't support these properly.
  REPLICATE4BIT = "replicate4bit",
  //^ To satisfy Replicate's 4 bit models' requirements where they also insert some INST tags
}

/**
 * Llama2 LLM implementation
 */
export class LlamaDeuce implements LLM {
  model: keyof typeof ALL_AVAILABLE_LLAMADEUCE_MODELS;
  chatStrategy: DeuceChatStrategy;
  temperature: number;
  topP: number;
  maxTokens?: number;
  replicateSession: ReplicateSession;
  hasStreaming: boolean;

  constructor(init?: Partial<LlamaDeuce>) {
    this.model = init?.model ?? "Llama-2-70b-chat-4bit";
    this.chatStrategy =
      init?.chatStrategy ??
      (this.model.endsWith("4bit")
        ? DeuceChatStrategy.REPLICATE4BIT // With the newer A16Z/Replicate models they do the system message themselves.
        : DeuceChatStrategy.METAWBOS); // With BOS and EOS seems to work best, although they all have problems past a certain point
    this.temperature = init?.temperature ?? 0.1; // minimum temperature is 0.01 for Replicate endpoint
    this.topP = init?.topP ?? 1;
    this.maxTokens =
      init?.maxTokens ??
      ALL_AVAILABLE_LLAMADEUCE_MODELS[this.model].contextWindow; // For Replicate, the default is 500 tokens which is too low.
    this.replicateSession = init?.replicateSession ?? new ReplicateSession();
    this.hasStreaming = init?.hasStreaming ?? false;
  }

  mapMessagesToPrompt(messages: ChatMessage[]) {
    if (this.chatStrategy === DeuceChatStrategy.A16Z) {
      return this.mapMessagesToPromptA16Z(messages);
    } else if (this.chatStrategy === DeuceChatStrategy.META) {
      return this.mapMessagesToPromptMeta(messages);
    } else if (this.chatStrategy === DeuceChatStrategy.METAWBOS) {
      return this.mapMessagesToPromptMeta(messages, { withBos: true });
    } else if (this.chatStrategy === DeuceChatStrategy.REPLICATE4BIT) {
      return this.mapMessagesToPromptMeta(messages, { replicate4Bit: true });
    } else {
      return this.mapMessagesToPromptMeta(messages);
    }
  }

  mapMessagesToPromptA16Z(messages: ChatMessage[]) {
    return {
      prompt:
        messages.reduce((acc, message) => {
          return (
            (acc && `${acc}\n\n`) +
            `${this.mapMessageTypeA16Z(message.role)}${message.content}`
          );
        }, "") + "\n\nAssistant:",
      //^ Here we're differing from A16Z by omitting the space. Generally spaces at the end of prompts decrease performance due to tokenization
      systemPrompt: undefined,
    };
  }

  mapMessageTypeA16Z(messageType: MessageType): string {
    switch (messageType) {
      case "user":
        return "User: ";
      case "assistant":
        return "Assistant: ";
      case "system":
        return "";
      default:
        throw new Error("Unsupported LlamaDeuce message type");
    }
  }

  mapMessagesToPromptMeta(
    messages: ChatMessage[],
    opts?: { withBos?: boolean; replicate4Bit?: boolean },
  ) {
    const { withBos = false, replicate4Bit = false } = opts ?? {};
    const DEFAULT_SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`;

    const B_SYS = "<<SYS>>\n";
    const E_SYS = "\n<</SYS>>\n\n";
    const B_INST = "[INST]";
    const E_INST = "[/INST]";
    const BOS = "<s>";
    const EOS = "</s>";

    if (messages.length === 0) {
      return { prompt: "", systemPrompt: undefined };
    }

    messages = [...messages]; // so we can use shift without mutating the original array

    let systemPrompt = undefined;
    if (messages[0].role === "system") {
      const systemMessage = messages.shift()!;

      if (replicate4Bit) {
        systemPrompt = systemMessage.content;
      } else {
        const systemStr = `${B_SYS}${systemMessage.content}${E_SYS}`;

        // TS Bug: https://github.com/microsoft/TypeScript/issues/9998
        // @ts-ignore
        if (messages[0].role !== "user") {
          throw new Error(
            "LlamaDeuce: if there is a system message, the second message must be a user message.",
          );
        }

        const userContent = messages[0].content;

        messages[0].content = `${systemStr}${userContent}`;
      }
    } else {
      if (!replicate4Bit) {
        messages[0].content = `${B_SYS}${DEFAULT_SYSTEM_PROMPT}${E_SYS}${messages[0].content}`;
      }
    }

    return {
      prompt: messages.reduce((acc, message, index) => {
        if (index % 2 === 0) {
          return `${acc}${
            withBos ? BOS : ""
          }${B_INST} ${message.content.trim()} ${E_INST}`;
        } else {
          return `${acc} ${message.content.trim()} ` + (withBos ? EOS : ""); // Yes, the EOS comes after the space. This is not a mistake.
        }
      }, ""),
      systemPrompt,
    };
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(messages: ChatMessage[], _parentEvent?: Event, streaming?: T): Promise<R> {
    const api = ALL_AVAILABLE_LLAMADEUCE_MODELS[this.model]
      .replicateApi as `${string}/${string}:${string}`;

    const { prompt, systemPrompt } = this.mapMessagesToPrompt(messages);

    const replicateOptions: any = {
      input: {
        prompt,
        system_prompt: systemPrompt,
        temperature: this.temperature,
        top_p: this.topP,
      },
    };

    if (this.model.endsWith("4bit")) {
      replicateOptions.input.max_new_tokens = this.maxTokens;
    } else {
      replicateOptions.input.max_length = this.maxTokens;
    }

    //TODO: Add streaming for this

    //Non-streaming
    const response = await this.replicateSession.replicate.run(
      api,
      replicateOptions,
    );
    return {
      message: {
        content: (response as Array<string>).join("").trimStart(),
        //^ We need to do this because Replicate returns a list of strings (for streaming functionality which is not exposed by the run function)
        role: "assistant",
      },
    } as R;
  }

  async complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(prompt: string, parentEvent?: Event, streaming?: T): Promise<R> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent);
  }
}

/**
 * Anthropic LLM implementation
 */

export class Anthropic implements LLM {
  // Per completion Anthropic params
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;

  // Anthropic session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: AnthropicSession;
  hasStreaming: boolean;

  callbackManager?: CallbackManager;

  constructor(init?: Partial<Anthropic>) {
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
    this.hasStreaming = init?.hasStreaming ?? true;

    this.callbackManager = init?.callbackManager;
  }

  mapMessagesToPrompt(messages: ChatMessage[]) {
    return (
      messages.reduce((acc, message) => {
        return (
          acc +
          `${
            message.role === "assistant"
              ? ANTHROPIC_AI_PROMPT
              : ANTHROPIC_HUMAN_PROMPT
          } ${message.content} `
        );
      }, "") + ANTHROPIC_AI_PROMPT
    );
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    messages: ChatMessage[],
    parentEvent?: Event | undefined,
    streaming?: T,
  ): Promise<R> {
    //Streaming
    if (streaming) {
      if (!this.hasStreaming) {
        throw Error("No streaming support for this LLM.");
      }
      return this.streamChat(messages, parentEvent) as R;
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
    } as R;
  }

  protected async *streamChat(
    messages: ChatMessage[],
    parentEvent?: Event | undefined,
  ): AsyncGenerator<string, void, unknown> {
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
      yield part.completion;
    }
    return;
  }

  async complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    prompt: string,
    parentEvent?: Event | undefined,
    streaming?: T,
  ): Promise<R> {
    if (streaming) {
      return this.streamComplete(prompt, parentEvent) as R;
    }
    return this.chat(
      [{ content: prompt, role: "user" }],
      parentEvent,
      streaming,
    ) as R;
  }

  protected streamComplete(
    prompt: string,
    parentEvent?: Event | undefined,
  ): AsyncGenerator<string, void, unknown> {
    return this.streamChat([{ content: prompt, role: "user" }], parentEvent);
  }
}


export class Portkey implements LLM {
  apiKey?: string = undefined;
  baseURL?: string = undefined;
  mode?: string = undefined;
  llms?: [LLMOptions] | null = undefined;
  session: PortkeySession;
  callbackManager?: CallbackManager;

  constructor(init?: Partial<Portkey>) {
    this.apiKey = init?.apiKey
    this.baseURL = init?.baseURL
    this.mode = init?.mode
    this.llms = init?.llms
    this.session = getPortkeySession({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      llms: this.llms,
      mode: this.mode
    })
    this.callbackManager = init?.callbackManager;
  }

  async chat(
    messages: ChatMessage[],
    parentEvent?: Event | undefined,
    params?: Record<string, any>
  ): Promise<ChatResponse> {
    const resolvedParams = params || {}
    const response = await this.session.portkey.chatCompletions.create({
      messages,
      ...resolvedParams
    });

    const content = response.choices[0].message?.content ?? "";
    const role = response.choices[0].message?.role || "assistant";
    return { message: { content, role: role as MessageType } };
  }
  async complete(
    prompt: string,
    parentEvent?: Event | undefined,
  ): Promise<CompletionResponse> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent);
  }

  async *stream_chat(
    messages: ChatMessage[],
    parentEvent?: Event,
    params?: Record<string, any>
  ): AsyncGenerator<string, void, unknown> {
    // Wrapping the stream in a callback.
    const onLLMStream = this.callbackManager?.onLLMStream
      ? this.callbackManager.onLLMStream
      : () => {};

    const chunk_stream =
      await this.session.portkey.chatCompletions.create({
        messages,
        ...params,
        stream: true,
      });

    const event: Event = parentEvent
      ? parentEvent
      : {
          id: "unspecified",
          type: "llmPredict" as EventType,
        };

    //Indices
    var idx_counter: number = 0;
    for await (const part of chunk_stream) {
      //Increment
      part.choices[0].index = idx_counter;
      const is_done: boolean =
        part.choices[0].finish_reason === "stop" ? true : false;
      //onLLMStream Callback

      const stream_callback: StreamCallbackResponse = {
        event: event,
        index: idx_counter,
        isDone: is_done,
        // token: part,
      };
      onLLMStream(stream_callback);

      idx_counter++;

      yield part.choices[0].delta?.content ?? "";
    }
    return;
  }

  stream_complete(
    query: string,
    parentEvent?: Event,
  ): AsyncGenerator<string, void, unknown> {
    return this.stream_chat([{ content: query, role: "user" }], parentEvent);
  }
}
