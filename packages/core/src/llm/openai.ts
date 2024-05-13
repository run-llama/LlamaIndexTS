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
  ChatCompletionMessageToolCall,
  ChatCompletionRole,
  ChatCompletionSystemMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
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
import { ToolCallLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  MessageType,
  PartialToolCall,
  ToolCallLLMMessageOptions,
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
  // fixme: wait for openai documentation
  "gpt-4o": { contextWindow: 128000 },
  "gpt-4o-2024-05-13": { contextWindow: 128000 },
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

export type OpenAIAdditionalMetadata = {};

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

export class OpenAI extends ToolCallLLM<OpenAIAdditionalChatOptions> {
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

  get supportToolCall() {
    return isFunctionCallingModel(this);
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
      default:
        return "user";
    }
  }

  static toOpenAIMessage(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): ChatCompletionMessageParam[] {
    return messages.map((message) => {
      const options = message.options ?? {};
      if ("toolResult" in options) {
        return {
          tool_call_id: options.toolResult.id,
          role: "tool",
          content: extractText(message.content),
        } satisfies ChatCompletionToolMessageParam;
      } else if ("toolCall" in options) {
        return {
          role: "assistant",
          content: extractText(message.content),
          tool_calls: [
            {
              id: options.toolCall.id,
              type: "function",
              function: {
                name: options.toolCall.name,
                arguments:
                  typeof options.toolCall.input === "string"
                    ? options.toolCall.input
                    : JSON.stringify(options.toolCall.input),
              },
            },
          ],
        } satisfies ChatCompletionAssistantMessageParam;
      } else if (message.role === "user") {
        return {
          role: "user",
          content: message.content,
        } satisfies ChatCompletionUserMessageParam;
      }

      const response:
        | ChatCompletionSystemMessageParam
        | ChatCompletionUserMessageParam
        | ChatCompletionMessageToolCall = {
        // fixme(alex): type assertion
        role: OpenAI.toOpenAIRole(message.role) as never,
        // fixme: should not extract text, but assert content is string
        content: extractText(message.content),
      };
      return response;
    });
  }

  chat(
    params: LLMChatParamsStreaming<
      OpenAIAdditionalChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>>;
  chat(
    params: LLMChatParamsNonStreaming<
      OpenAIAdditionalChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;
  @wrapEventCaller
  @wrapLLMEvent
  async chat(
    params:
      | LLMChatParamsNonStreaming<
          OpenAIAdditionalChatOptions,
          ToolCallLLMMessageOptions
        >
      | LLMChatParamsStreaming<
          OpenAIAdditionalChatOptions,
          ToolCallLLMMessageOptions
        >,
  ): Promise<
    | ChatResponse<ToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>
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

    if (
      Array.isArray(baseRequestParams.tools) &&
      baseRequestParams.tools.length === 0
    ) {
      // remove empty tools array to avoid OpenAI error
      delete baseRequestParams.tools;
    }

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

    return {
      raw: response,
      message: {
        content,
        role: response.choices[0].message.role,
        options: response.choices[0].message?.tool_calls
          ? {
              toolCall: {
                id: response.choices[0].message.tool_calls[0].id,
                name: response.choices[0].message.tool_calls[0].function.name,
                input:
                  response.choices[0].message.tool_calls[0].function.arguments,
              },
            }
          : {},
      },
    };
  }

  // todo: this wrapper is ugly, refactor it
  @wrapEventCaller
  protected async *streamChat(
    baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams,
  ): AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>> {
    const stream: AsyncIterable<OpenAILLM.Chat.ChatCompletionChunk> =
      await this.session.openai.chat.completions.create({
        ...baseRequestParams,
        stream: true,
      });

    // TODO: add callback to streamConverter and use streamConverter here
    //Indices
    let idxCounter: number = 0;
    // this will be used to keep track of the current tool call, make sure input are valid json object.
    let currentToolCall: PartialToolCall | null = null;
    const toolCallMap = new Map<string, PartialToolCall>();
    for await (const part of stream) {
      if (part.choices.length === 0) continue;
      const choice = part.choices[0];
      // skip parts that don't have any content
      if (!(choice.delta.content || choice.delta.tool_calls)) continue;

      let shouldEmitToolCall: PartialToolCall | null = null;
      if (
        choice.delta.tool_calls?.[0].id &&
        currentToolCall &&
        choice.delta.tool_calls?.[0].id !== currentToolCall.id
      ) {
        shouldEmitToolCall = {
          ...currentToolCall,
          input: JSON.parse(currentToolCall.input),
        };
      }
      if (choice.delta.tool_calls?.[0].id) {
        currentToolCall = {
          name: choice.delta.tool_calls[0].function!.name!,
          id: choice.delta.tool_calls[0].id,
          input: choice.delta.tool_calls[0].function!.arguments!,
        };
        toolCallMap.set(choice.delta.tool_calls[0].id, currentToolCall);
      } else {
        if (choice.delta.tool_calls?.[0].function?.arguments) {
          currentToolCall!.input +=
            choice.delta.tool_calls[0].function.arguments;
        }
      }

      const isDone: boolean = choice.finish_reason !== null;

      getCallbackManager().dispatchEvent("stream", {
        index: idxCounter++,
        isDone: isDone,
        token: part,
      });

      if (isDone && currentToolCall) {
        // for the last one, we need to emit the tool call
        shouldEmitToolCall = {
          ...currentToolCall,
          input: JSON.parse(currentToolCall.input),
        };
      }

      yield {
        raw: part,
        options: shouldEmitToolCall
          ? { toolCall: shouldEmitToolCall }
          : currentToolCall
            ? {
                toolCall: currentToolCall,
              }
            : {},
        delta: choice.delta.content ?? "",
      };
    }
    toolCallMap.clear();
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
