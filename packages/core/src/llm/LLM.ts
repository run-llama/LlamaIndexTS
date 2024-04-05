import type OpenAILLM from "openai";
import type { ClientOptions as OpenAIClientOptions } from "openai";
import {
  type OpenAIStreamToken,
  type StreamCallbackResponse,
} from "../callbacks/CallbackManager.js";

import type {
  Tool,
  ToolResultBlockParam,
  ToolsBetaMessageParam,
} from "@anthropic-ai/sdk/resources/beta/tools/messages";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import type { ChatCompletionMessageParam } from "openai/resources/index.js";
import type { LLMOptions } from "portkey-ai";
import { Tokenizers } from "../GlobalsHelper.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import type { BaseTool } from "../types.js";
import type { AnthropicSession } from "./anthropic.js";
import { getAnthropicSession } from "./anthropic.js";
import type { AzureOpenAIConfig } from "./azure.js";
import {
  getAzureBaseUrl,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure.js";
import { BaseLLM } from "./base.js";
import type { OpenAISession } from "./open_ai.js";
import { getOpenAISession } from "./open_ai.js";
import type { PortkeySession } from "./portkey.js";
import { getPortkeySession } from "./portkey.js";
import { ReplicateSession } from "./replicate_ai.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  MessageType,
} from "./types.js";
import { wrapLLMEvent } from "./utils.js";

export const GPT4_MODELS = {
  "gpt-4": { contextWindow: 8192 },
  "gpt-4-32k": { contextWindow: 32768 },
  "gpt-4-32k-0613": { contextWindow: 32768 },
  "gpt-4-turbo-preview": { contextWindow: 128000 },
  "gpt-4-1106-preview": { contextWindow: 128000 },
  "gpt-4-0125-preview": { contextWindow: 128000 },
  "gpt-4-vision-preview": { contextWindow: 128000 },
};

// NOTE we don't currently support gpt-3.5-turbo-instruct and don't plan to in the near future
export const GPT35_MODELS = {
  "gpt-3.5-turbo": { contextWindow: 4096 },
  "gpt-3.5-turbo-0613": { contextWindow: 4096 },
  "gpt-3.5-turbo-16k": { contextWindow: 16384 },
  "gpt-3.5-turbo-16k-0613": { contextWindow: 16384 },
  "gpt-3.5-turbo-1106": { contextWindow: 16384 },
  "gpt-3.5-turbo-0125": { contextWindow: 16384 },
};

/**
 * We currently support GPT-3.5 and GPT-4 models
 */
export const ALL_AVAILABLE_OPENAI_MODELS = {
  ...GPT4_MODELS,
  ...GPT35_MODELS,
};

export const isFunctionCallingModel = (model: string): boolean => {
  const isChatModel = Object.keys(ALL_AVAILABLE_OPENAI_MODELS).includes(model);
  const isOld = model.includes("0314") || model.includes("0301");
  return isChatModel && !isOld;
};

/**
 * OpenAI LLM implementation
 */
export class OpenAI extends BaseLLM<{
  toolChoice?: ChatCompletionToolChoiceOption;
}> {
  // Per completion OpenAI params
  model: keyof typeof ALL_AVAILABLE_OPENAI_MODELS | string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  additionalChatOptions?: Omit<
    Partial<OpenAILLM.Chat.ChatCompletionCreateParams>,
    | "max_tokens"
    | "messages"
    | "model"
    | "temperature"
    | "top_p"
    | "stream"
    | "tools"
    | "toolChoice"
  >;

  // OpenAI session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: OpenAISession;
  additionalSessionOptions?: Omit<
    Partial<OpenAIClientOptions>,
    "apiKey" | "maxRetries" | "timeout"
  >;

  constructor(
    init?: Partial<OpenAI> & {
      azure?: AzureOpenAIConfig;
    },
  ) {
    super();
    this.model = init?.model ?? "gpt-3.5-turbo";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalChatOptions = init?.additionalChatOptions;
    this.additionalSessionOptions = init?.additionalSessionOptions;

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
  }

  get metadata() {
    const contextWindow =
      ALL_AVAILABLE_OPENAI_MODELS[
        this.model as keyof typeof ALL_AVAILABLE_OPENAI_MODELS
      ]?.contextWindow ?? 1024;
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow,
      tokenizer: Tokenizers.CL100K_BASE,
      isFunctionCallingModel: isFunctionCallingModel(this.model),
    };
  }

  mapMessageType(
    messageType: MessageType,
  ): "user" | "assistant" | "system" | "function" | "tool" {
    switch (messageType) {
      case "user":
        return "user";
      case "assistant":
        return "assistant";
      case "system":
        return "system";
      case "function":
        return "function";
      case "tool":
        return "tool";
      default:
        return "user";
    }
  }

  toOpenAIMessage(messages: ChatMessage[]) {
    return messages.map((message) => {
      const additionalKwargs = message.additionalKwargs ?? {};

      if (message.additionalKwargs?.toolCalls) {
        additionalKwargs.tool_calls = message.additionalKwargs.toolCalls;
        delete additionalKwargs.toolCalls;
      }

      return {
        role: this.mapMessageType(message.role),
        content: message.content,
        ...additionalKwargs,
      };
    });
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapEventCaller
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, stream, tools, extraParams } = params;
    const baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      tools: tools?.map((tool) => OpenAI.toTool(tool)),
      messages: this.toOpenAIMessage(messages) as ChatCompletionMessageParam[],
      top_p: this.topP,
      ...Object.assign(
        Object.create(null),
        extraParams,
        this.additionalChatOptions,
      ),
    };

    // Streaming
    if (stream) {
      return this.streamChat(params);
    }

    // Non-streaming
    const response = await this.session.openai.chat.completions.create({
      ...baseRequestParams,
      stream: false,
    });

    const content = response.choices[0].message?.content ?? null;

    const kwargsOutput: Record<string, any> = {};

    if (response.choices[0].message?.tool_calls) {
      kwargsOutput.toolCalls = response.choices[0].message.tool_calls;
    }

    return {
      message: {
        content,
        role: response.choices[0].message.role,
        additionalKwargs: kwargsOutput,
      },
    };
  }

  @wrapEventCaller
  protected async *streamChat({
    messages,
    extraParams,
  }: LLMChatParamsStreaming): AsyncIterable<ChatResponseChunk> {
    const baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: messages.map(
        (message) =>
          ({
            role: this.mapMessageType(message.role),
            content: message.content,
          }) as ChatCompletionMessageParam,
      ),
      top_p: this.topP,
      ...Object.assign(
        Object.create(null),
        extraParams,
        this.additionalChatOptions,
      ),
    };

    const chunk_stream: AsyncIterable<OpenAIStreamToken> =
      await this.session.openai.chat.completions.create({
        ...baseRequestParams,
        stream: true,
      });

    // TODO: add callback to streamConverter and use streamConverter here
    //Indices
    let idx_counter: number = 0;
    for await (const part of chunk_stream) {
      if (!part.choices.length) continue;

      //Increment
      part.choices[0].index = idx_counter;
      const is_done: boolean = part.choices[0].finish_reason === "stop";
      //onLLMStream Callback

      const stream_callback: StreamCallbackResponse = {
        index: idx_counter,
        isDone: is_done,
        token: part,
      };
      getCallbackManager().dispatchEvent("stream", stream_callback);

      idx_counter++;

      yield {
        delta: part.choices[0].delta.content ?? "",
      };
    }
    return;
  }

  static toTool(tool: BaseTool): ChatCompletionTool {
    return {
      type: "function",
      function: {
        name: tool.metadata.name,
        description: tool.metadata.description,
        parameters: tool.metadata.parameters,
      },
    };
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
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
    //^ Model is based off of exllama 4bit.
  },
  "Llama-2-13b-chat-old": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
  },
  //^ Last known good 13b non-quantized model. In future versions they add the SYS and INST tags themselves
  "Llama-2-13b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
  },
  "Llama-2-7b-chat-old": {
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
      "meta/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0",
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
  REPLICATE4BITWNEWLINES = "replicate4bitwnewlines",
  //^ Replicate's documentation recommends using newlines: https://replicate.com/blog/how-to-prompt-llama
}

/**
 * Llama2 LLM implementation
 */
export class LlamaDeuce extends BaseLLM {
  model: keyof typeof ALL_AVAILABLE_LLAMADEUCE_MODELS;
  chatStrategy: DeuceChatStrategy;
  temperature: number;
  topP: number;
  maxTokens?: number;
  replicateSession: ReplicateSession;

  constructor(init?: Partial<LlamaDeuce>) {
    super();
    this.model = init?.model ?? "Llama-2-70b-chat-4bit";
    this.chatStrategy =
      init?.chatStrategy ??
      (this.model.endsWith("4bit")
        ? DeuceChatStrategy.REPLICATE4BITWNEWLINES // With the newer Replicate models they do the system message themselves.
        : DeuceChatStrategy.METAWBOS); // With BOS and EOS seems to work best, although they all have problems past a certain point
    this.temperature = init?.temperature ?? 0.1; // minimum temperature is 0.01 for Replicate endpoint
    this.topP = init?.topP ?? 1;
    this.maxTokens =
      init?.maxTokens ??
      ALL_AVAILABLE_LLAMADEUCE_MODELS[this.model].contextWindow; // For Replicate, the default is 500 tokens which is too low.
    this.replicateSession = init?.replicateSession ?? new ReplicateSession();
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: ALL_AVAILABLE_LLAMADEUCE_MODELS[this.model].contextWindow,
      tokenizer: undefined,
    };
  }

  mapMessagesToPrompt(messages: ChatMessage[]) {
    if (this.chatStrategy === DeuceChatStrategy.A16Z) {
      return this.mapMessagesToPromptA16Z(messages);
    } else if (this.chatStrategy === DeuceChatStrategy.META) {
      return this.mapMessagesToPromptMeta(messages);
    } else if (this.chatStrategy === DeuceChatStrategy.METAWBOS) {
      return this.mapMessagesToPromptMeta(messages, { withBos: true });
    } else if (this.chatStrategy === DeuceChatStrategy.REPLICATE4BIT) {
      return this.mapMessagesToPromptMeta(messages, {
        replicate4Bit: true,
        withNewlines: true,
      });
    } else if (this.chatStrategy === DeuceChatStrategy.REPLICATE4BITWNEWLINES) {
      return this.mapMessagesToPromptMeta(messages, {
        replicate4Bit: true,
        withNewlines: true,
      });
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
    opts?: {
      withBos?: boolean;
      replicate4Bit?: boolean;
      withNewlines?: boolean;
    },
  ) {
    const {
      withBos = false,
      replicate4Bit = false,
      withNewlines = false,
    } = opts ?? {};
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
          return (
            `${acc}${
              withBos ? BOS : ""
            }${B_INST} ${message.content.trim()} ${E_INST}` +
            (withNewlines ? "\n" : "")
          );
        } else {
          return (
            `${acc} ${message.content.trim()}` +
            (withNewlines ? "\n" : " ") +
            (withBos ? EOS : "")
          ); // Yes, the EOS comes after the space. This is not a mistake.
        }
      }, ""),
      systemPrompt,
    };
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, stream } = params;
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
    if (stream) {
      throw new Error("Streaming not supported for LlamaDeuce");
    }

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
    };
  }
}

export const ANTHROPIC_MODELS_METADATA = {
  "claude-instant-1.2": {
    contextWindow: 100000,
  },
  "claude-2.1": {
    contextWindow: 200000,
  },
  "claude-3-opus-20240229": { contextWindow: 200000 },
  "claude-3-sonnet-20240229": { contextWindow: 200000 },
  "claude-3-haiku-20240307": { contextWindow: 200000 },
} satisfies { [key in AnthropicModelWithDate]: Partial<LLMMetadata> };

const AVAILABLE_ANTHROPIC_MODELS_WITH_DATE_MAP = {
  "claude-3-opus": "claude-3-opus-20240229",
  "claude-3-sonnet": "claude-3-sonnet-20240229",
  "claude-3-haiku": "claude-3-haiku-20240307",
  "claude-2.1": "claude-2.1",
  "claude-instant-1.2": "claude-instant-1.2",
} as const satisfies { [key in AnthropicModel]: string };

type AnthropicModel =
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "claude-2.1"
  | "claude-instant-1.2";
type AnthropicModelWithDate =
  (typeof AVAILABLE_ANTHROPIC_MODELS_WITH_DATE_MAP)[AnthropicModel];

/**
 * Anthropic LLM implementation
 */

export class Anthropic extends BaseLLM {
  // Per completion Anthropic params
  model: AnthropicModelWithDate;
  temperature: number;
  topP: number;
  maxTokens?: number;

  // Anthropic session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: AnthropicSession;

  constructor(
    init?: Partial<Omit<Anthropic, "model">> & { model: AnthropicModel },
  ) {
    super();
    this.model = Anthropic.getModelName(init?.model ?? "claude-3-opus");
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
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: ANTHROPIC_MODELS_METADATA[this.model].contextWindow,
      tokenizer: undefined,
    };
  }

  static getModelName(model: AnthropicModel): AnthropicModelWithDate {
    return AVAILABLE_ANTHROPIC_MODELS_WITH_DATE_MAP[model] ?? model;
  }

  formatMessages(messages: ChatMessage[]) {
    return messages.map((message) => {
      if (message.role !== "user" && message.role !== "assistant") {
        throw new Error("Unsupported Anthropic role");
      }

      return {
        content: message.content,
        role: message.role,
      };
    });
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    let { messages } = params;

    const { stream, tools } = params;

    let systemPrompt: string | null = null;

    const systemMessages = messages.filter(
      (message) => message.role === "system",
    );

    if (systemMessages.length > 0) {
      systemPrompt = systemMessages
        .map((message) => message.content)
        .join("\n");
      messages = messages.filter((message) => message.role !== "system");
    }

    // case: Streaming
    if (stream) {
      return this.streamChat(messages, systemPrompt, tools);
    }
    // case: Non-streaming
    const anthropic = this.session.anthropic;

    if (tools) {
      if (this.model !== "claude-3-opus-20240229") {
        throw new TypeError(
          "Tools are only supported for claude-3-opus-20240229",
        );
      }
      const response = await anthropic.beta.tools.messages.create({
        messages: this.formatMessages(messages),
        tools: tools.map(Anthropic.toTool),
        model: this.model,
        temperature: this.temperature,
        // fixme: this number is from example https://github.com/anthropics/anthropic-sdk-typescript/commit/5bcaddbd396fa81e9b65bf2ce3b2917affae5c0a
        max_tokens: 1024,
        top_p: this.topP,
        ...(systemPrompt && { system: systemPrompt }),
      });
      // todo(alex): use a better way to check if `tool_use` is present
      // fixme(alex): we should handle function call outside of the chat method
      //  FIX THIS BEFORE MERGING
      if (
        response.content.length > 1 &&
        response.content[1].type === "tool_use"
      ) {
        const targetName = response.content[1].name;
        const tool = tools.find((tool) => tool.metadata.name === targetName);
        if (tool) {
          let error_message: unknown;
          let result: unknown;
          try {
            if (
              !(
                response.content[1].input != null &&
                typeof response.content[1].input === "object"
              )
            ) {
              console.warn(
                "Tool input is not an object, which is an unexpected behavior",
              );
            }
            getCallbackManager().dispatchEvent("llm-function-call", {
              payload: {
                tool: tool,
                input: response.content[1].input,
              },
            });
            result = await tool.handler(response.content[1].input as never);
          } catch (e) {
            error_message = e;
          }
          const aiPrevMessages: ToolsBetaMessageParam = {
            role: "assistant",
            content: response.content,
          };
          const toolResultMessageParam: ToolResultBlockParam = {
            type: "tool_result",
            tool_use_id: response.content[1].id,
            is_error: error_message !== undefined,
            content: [
              {
                type: "text",
                text: error_message ? `${error_message}` : `${result}`,
              },
            ],
          };
          return this.chat({
            ...params,
            messages: [
              ...params.messages,
              aiPrevMessages,
              {
                content: [toolResultMessageParam],
                role: "user",
              },
            ],
          });
        } else {
          throw new TypeError(`Tool ${targetName} not found`);
        }
      } else {
        return {
          message: {
            content:
              response.content[0].type === "text"
                ? response.content[0].text
                : (() => {
                    throw new TypeError("Unexpected response type");
                  })(),
            role: "assistant",
          },
        };
      }
    } else {
      const response = await anthropic.messages.create({
        model: this.model,
        messages: this.formatMessages(messages),
        max_tokens: this.maxTokens ?? 4096,
        temperature: this.temperature,
        top_p: this.topP,
        ...(systemPrompt && { system: systemPrompt }),
      });

      return {
        message: { content: response.content[0].text, role: "assistant" },
      };
    }
  }

  protected async *streamChat(
    messages: ChatMessage[],
    systemPrompt?: string | null,
    tools?: BaseTool[],
  ): AsyncIterable<ChatResponseChunk> {
    if (tools) {
      throw new TypeError(
        "not supported yet, see https://docs.anthropic.com/claude/docs/tool-use",
      );
    } else {
      const stream = await this.session.anthropic.messages.create({
        model: this.model,
        messages: this.formatMessages(messages),
        max_tokens: this.maxTokens ?? 4096,
        temperature: this.temperature,
        top_p: this.topP,
        stream: true,
        ...(systemPrompt && { system: systemPrompt }),
      });

      let idx_counter: number = 0;
      for await (const part of stream) {
        const content =
          part.type === "content_block_delta" ? part.delta.text : null;

        if (typeof content !== "string") continue;

        idx_counter++;
        yield { delta: content };
      }
    }
  }

  static toTool(tool: BaseTool): Tool {
    if (tool.metadata.parameters?.type !== "object") {
      throw new TypeError("Tool parameters must be an object");
    }
    return {
      input_schema: {
        type: "object",
        properties: tool.metadata.parameters.properties,
        required: tool.metadata.parameters.required,
      },
      name: tool.metadata.name,
      description: tool.metadata.description,
    };
  }
}

export class Portkey extends BaseLLM {
  apiKey?: string = undefined;
  baseURL?: string = undefined;
  mode?: string = undefined;
  llms?: [LLMOptions] | null = undefined;
  session: PortkeySession;

  constructor(init?: Partial<Portkey>) {
    super();
    this.apiKey = init?.apiKey;
    this.baseURL = init?.baseURL;
    this.mode = init?.mode;
    this.llms = init?.llms;
    this.session = getPortkeySession({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      llms: this.llms,
      mode: this.mode,
    });
  }

  get metadata(): LLMMetadata {
    throw new Error("metadata not implemented for Portkey");
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, stream, extraParams } = params;
    if (stream) {
      return this.streamChat(messages, extraParams);
    } else {
      const bodyParams = extraParams || {};
      const response = await this.session.portkey.chatCompletions.create({
        messages,
        ...bodyParams,
      });

      const content = response.choices[0].message?.content ?? "";
      const role = response.choices[0].message?.role || "assistant";
      return { message: { content, role: role as MessageType } };
    }
  }

  async *streamChat(
    messages: ChatMessage[],
    params?: Record<string, any>,
  ): AsyncIterable<ChatResponseChunk> {
    const chunkStream = await this.session.portkey.chatCompletions.create({
      messages,
      ...params,
      stream: true,
    });

    //Indices
    let idx_counter: number = 0;
    for await (const part of chunkStream) {
      //Increment
      part.choices[0].index = idx_counter;
      const is_done: boolean = part.choices[0].finish_reason === "stop";
      //onLLMStream Callback

      const stream_callback: StreamCallbackResponse = {
        index: idx_counter,
        isDone: is_done,
        // token: part,
      };
      getCallbackManager().dispatchEvent("stream", stream_callback);

      idx_counter++;

      yield { delta: part.choices[0].delta?.content ?? "" };
    }
    return;
  }
}
