import { getEnv } from "@llamaindex/env";
import _ from "lodash";
import type OpenAILLM from "openai";
import type {
  ClientOptions,
  ClientOptions as OpenAIClientOptions,
} from "openai";
import { OpenAI as OrigOpenAI } from "openai";

import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionRole,
  ChatCompletionSystemMessageParam,
  ChatCompletionTool,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat/completions";
import type { ChatCompletionMessageParam } from "openai/resources/index.js";
import { Tokenizers } from "../GlobalsHelper.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import type { BaseTool } from "../types.js";
import type { AzureOpenAIConfig } from "./azure.js";
import {
  getAzureBaseUrl,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure.js";
import { BaseLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  MessageToolCall,
  MessageType,
} from "./types.js";
import { extractText, wrapLLMEvent } from "./utils.js";

export class AzureOpenAI extends OrigOpenAI {
  protected override authHeaders() {
    return { "api-key": this.apiKey };
  }
}

export class OpenAISession {
  openai: OrigOpenAI;

  constructor(options: ClientOptions & { azure?: boolean } = {}) {
    if (!options.apiKey) {
      options.apiKey = getEnv("OPENAI_API_KEY");
    }

    if (!options.apiKey) {
      throw new Error("Set OpenAI Key in OPENAI_API_KEY env variable"); // Overriding OpenAI package's error message
    }

    if (options.azure) {
      this.openai = new AzureOpenAI(options);
    } else {
      this.openai = new OrigOpenAI({
        ...options,
        // defaultHeaders: { "OpenAI-Beta": "assistants=v1" },
      });
    }
  }
}

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
const defaultOpenAISession: {
  session: OpenAISession;
  options: ClientOptions;
}[] = [];

/**
 * Get a session for the OpenAI API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getOpenAISession(
  options: ClientOptions & { azure?: boolean } = {},
) {
  let session = defaultOpenAISession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new OpenAISession(options);
    defaultOpenAISession.push({ session, options });
  }

  return session;
}

export const GPT4_MODELS = {
  "gpt-4": { contextWindow: 8192 },
  "gpt-4-32k": { contextWindow: 32768 },
  "gpt-4-32k-0613": { contextWindow: 32768 },
  "gpt-4-turbo": { contextWindow: 128000 },
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

export function isFunctionCallingModel(llm: LLM): llm is OpenAI {
  let model: string;
  if (llm instanceof OpenAI) {
    model = llm.model;
  } else if ("model" in llm && typeof llm.model === "string") {
    model = llm.model;
  } else {
    return false;
  }
  const isChatModel = Object.keys(ALL_AVAILABLE_OPENAI_MODELS).includes(model);
  const isOld = model.includes("0314") || model.includes("0301");
  return isChatModel && !isOld;
}

export type OpenAIAdditionalMetadata = {
  isFunctionCallingModel: boolean;
};

export type OpenAIAdditionalMessageOptions = {
  functionName?: string;
  toolCalls?: ChatCompletionMessageToolCall[];
};

export type OpenAIAdditionalChatOptions = Omit<
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

export class OpenAI extends BaseLLM<
  OpenAIAdditionalChatOptions,
  OpenAIAdditionalMessageOptions
> {
  // Per completion OpenAI params
  model: keyof typeof ALL_AVAILABLE_OPENAI_MODELS | string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  additionalChatOptions?: OpenAIAdditionalChatOptions;

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

  get metadata(): LLMMetadata & OpenAIAdditionalMetadata {
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
      isFunctionCallingModel: isFunctionCallingModel(this),
    };
  }

  static toOpenAIRole(messageType: MessageType): ChatCompletionRole {
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

  static toOpenAIMessage(
    messages: ChatMessage<OpenAIAdditionalMessageOptions>[],
  ): ChatCompletionMessageParam[] {
    return messages.map((message) => {
      const options: OpenAIAdditionalMessageOptions = message.options ?? {};
      if (message.role === "user") {
        return {
          role: "user",
          content: message.content,
        } satisfies ChatCompletionUserMessageParam;
      }
      if (typeof message.content !== "string") {
        console.warn("Message content is not a string");
      }
      if (message.role === "function") {
        if (!options.functionName) {
          console.warn("Function message does not have a name");
        }
        return {
          role: "function",
          name: options.functionName ?? "UNKNOWN",
          content: extractText(message.content),
          // todo: remove this since this is deprecated in the OpenAI API
        } satisfies ChatCompletionFunctionMessageParam;
      }
      if (message.role === "assistant") {
        return {
          role: "assistant",
          content: extractText(message.content),
          tool_calls: options.toolCalls,
        } satisfies ChatCompletionAssistantMessageParam;
      }

      const response:
        | ChatCompletionSystemMessageParam
        | ChatCompletionUserMessageParam
        | ChatCompletionMessageToolCall = {
        // fixme(alex): type assertion
        role: OpenAI.toOpenAIRole(message.role) as never,
        // fixme: should not extract text, but assert content is string
        content: extractText(message.content),
        ...options,
      };
      return response;
    });
  }

  chat(
    params: LLMChatParamsStreaming<OpenAIAdditionalChatOptions>,
  ): Promise<AsyncIterable<ChatResponseChunk<OpenAIAdditionalMessageOptions>>>;
  chat(
    params: LLMChatParamsNonStreaming<OpenAIAdditionalChatOptions>,
  ): Promise<ChatResponse<OpenAIAdditionalMessageOptions>>;
  @wrapEventCaller
  @wrapLLMEvent
  async chat(
    params:
      | LLMChatParamsNonStreaming<OpenAIAdditionalChatOptions>
      | LLMChatParamsStreaming<OpenAIAdditionalChatOptions>,
  ): Promise<
    | ChatResponse<OpenAIAdditionalMessageOptions>
    | AsyncIterable<ChatResponseChunk<OpenAIAdditionalMessageOptions>>
  > {
    const { messages, stream, tools, additionalChatOptions } = params;
    const baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      tools: tools?.map(OpenAI.toTool),
      messages: OpenAI.toOpenAIMessage(messages),
      top_p: this.topP,
      ...Object.assign({}, this.additionalChatOptions, additionalChatOptions),
    };

    // Streaming
    if (stream) {
      return this.streamChat(baseRequestParams);
    }

    // Non-streaming
    const response = await this.session.openai.chat.completions.create({
      ...baseRequestParams,
      stream: false,
    });

    const content = response.choices[0].message?.content ?? "";

    const options: OpenAIAdditionalMessageOptions = {};

    if (response.choices[0].message?.tool_calls) {
      options.toolCalls = response.choices[0].message.tool_calls;
    }

    return {
      raw: response,
      message: {
        content,
        role: response.choices[0].message.role,
        options,
      },
    };
  }

  @wrapEventCaller
  protected async *streamChat(
    baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams,
  ): AsyncIterable<ChatResponseChunk<OpenAIAdditionalMessageOptions>> {
    const stream: AsyncIterable<OpenAILLM.Chat.ChatCompletionChunk> =
      await this.session.openai.chat.completions.create({
        ...baseRequestParams,
        stream: true,
      });

    // TODO: add callback to streamConverter and use streamConverter here
    //Indices
    let idxCounter: number = 0;
    const toolCalls: MessageToolCall[] = [];
    for await (const part of stream) {
      if (!part.choices.length) continue;
      const choice = part.choices[0];
      // skip parts that don't have any content
      if (!(choice.delta.content || choice.delta.tool_calls)) continue;
      updateToolCalls(toolCalls, choice.delta.tool_calls);

      const isDone: boolean = choice.finish_reason !== null;

      getCallbackManager().dispatchEvent("stream", {
        index: idxCounter++,
        isDone: isDone,
        token: part,
      });

      yield {
        raw: part,
        // add tool calls to final chunk
        options: toolCalls.length > 0 ? { toolCalls: toolCalls } : {},
        delta: choice.delta.content ?? "",
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

function updateToolCalls(
  toolCalls: MessageToolCall[],
  toolCallDeltas?: OpenAILLM.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[],
) {
  function augmentToolCall(
    toolCall?: MessageToolCall,
    toolCallDelta?: OpenAILLM.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall,
  ) {
    toolCall =
      toolCall ??
      ({ function: { name: "", arguments: "" } } as MessageToolCall);
    toolCall.id = toolCall.id ?? toolCallDelta?.id;
    toolCall.type = toolCall.type ?? toolCallDelta?.type;
    if (toolCallDelta?.function?.arguments) {
      toolCall.function.arguments += toolCallDelta.function.arguments;
    }
    if (toolCallDelta?.function?.name) {
      toolCall.function.name += toolCallDelta.function.name;
    }
    return toolCall;
  }
  if (toolCallDeltas) {
    toolCallDeltas?.forEach((toolCall) => {
      toolCalls[toolCall.index] = augmentToolCall(
        toolCalls[toolCall.index],
        toolCall,
      );
    });
  }
}
