import { wrapEventCaller, wrapLLMEvent } from "@llamaindex/core/decorator";
import {
  type BaseTool,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLM,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type MessageType,
  type PartialToolCall,
  ToolCallLLM,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import { Tokenizers } from "@llamaindex/env/tokenizers";
import type {
  AzureClientOptions,
  AzureOpenAI as AzureOpenAILLM,
  ClientOptions as OpenAIClientOptions,
  OpenAI as OpenAILLM,
} from "openai";
import type { ChatModel } from "openai/resources/chat/chat";
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
import {
  AzureOpenAIWithUserAgent,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure.js";

export const GPT4_MODELS = {
  "chatgpt-4o-latest": {
    contextWindow: 128000,
  },
  "gpt-4": { contextWindow: 8192 },
  "gpt-4-32k": { contextWindow: 32768 },
  "gpt-4-32k-0613": { contextWindow: 32768 },
  "gpt-4-turbo": { contextWindow: 128000 },
  "gpt-4-turbo-preview": { contextWindow: 128000 },
  "gpt-4-1106-preview": { contextWindow: 128000 },
  "gpt-4-0125-preview": { contextWindow: 128000 },
  "gpt-4-vision-preview": { contextWindow: 128000 },
  "gpt-4o": { contextWindow: 128000 },
  "gpt-4o-2024-05-13": { contextWindow: 128000 },
  "gpt-4o-mini": { contextWindow: 128000 },
  "gpt-4o-mini-2024-07-18": { contextWindow: 128000 },
  "gpt-4o-2024-08-06": { contextWindow: 128000 },
  "gpt-4o-2024-09-14": { contextWindow: 128000 },
  "gpt-4o-2024-10-14": { contextWindow: 128000 },
  "gpt-4-0613": { contextWindow: 128000 },
  "gpt-4-turbo-2024-04-09": { contextWindow: 128000 },
  "gpt-4-0314": { contextWindow: 128000 },
  "gpt-4-32k-0314": { contextWindow: 32768 },
  "gpt-4o-realtime-preview": {
    contextWindow: 128000,
  },
  "gpt-4o-realtime-preview-2024-10-01": {
    contextWindow: 128000,
  },
  "gpt-4o-audio-preview": {
    contextWindow: 128000,
  },
  "gpt-4o-audio-preview-2024-10-01": {
    contextWindow: 128000,
  },
  "gpt-4o-2024-11-20": {
    contextWindow: 128000,
  },
};

// NOTE we don't currently support gpt-3.5-turbo-instruct and don't plan to in the near future
export const GPT35_MODELS = {
  "gpt-3.5-turbo": { contextWindow: 16385 },
  "gpt-3.5-turbo-0613": { contextWindow: 4096 },
  "gpt-3.5-turbo-16k": { contextWindow: 16385 },
  "gpt-3.5-turbo-16k-0613": { contextWindow: 16385 },
  "gpt-3.5-turbo-1106": { contextWindow: 16385 },
  "gpt-3.5-turbo-0125": { contextWindow: 16385 },
  "gpt-3.5-turbo-0301": { contextWindow: 16385 },
};

export const O1_MODELS = {
  "o1-preview": {
    contextWindow: 128000,
  },
  "o1-preview-2024-09-12": {
    contextWindow: 128000,
  },
  "o1-mini": {
    contextWindow: 128000,
  },
  "o1-mini-2024-09-12": {
    contextWindow: 128000,
  },
};

export const O3_MODELS = {
  "o3-mini": {
    contextWindow: 200000,
  },
  "o3-mini-2025-01-31": {
    contextWindow: 200000,
  },
};

/**
 * We currently support GPT-3.5 and GPT-4 models
 */
export const ALL_AVAILABLE_OPENAI_MODELS = {
  ...GPT4_MODELS,
  ...GPT35_MODELS,
  ...O1_MODELS,
  ...O3_MODELS,
} satisfies Record<ChatModel, { contextWindow: number }>;

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
  const isO1 = model.startsWith("o1");
  return isChatModel && !isOld && !isO1;
}

export type OpenAIAdditionalMetadata = object;

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

type LLMInstance = Pick<AzureOpenAILLM | OpenAILLM, "chat" | "apiKey">;

export class OpenAI extends ToolCallLLM<OpenAIAdditionalChatOptions> {
  model:
    | ChatModel
    // string & {} is a hack to allow any string, but still give autocomplete
    | (string & {});
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  additionalChatOptions?: OpenAIAdditionalChatOptions | undefined;

  // OpenAI session params
  apiKey?: string | undefined = undefined;
  maxRetries: number;
  timeout?: number;
  additionalSessionOptions?:
    | undefined
    | Omit<Partial<OpenAIClientOptions>, "apiKey" | "maxRetries" | "timeout">;

  // use lazy here to avoid check OPENAI_API_KEY immediately
  lazySession: () => Promise<LLMInstance>;
  #session: Promise<LLMInstance> | null = null;
  get session() {
    if (!this.#session) {
      this.#session = this.lazySession();
    }
    return this.#session;
  }

  constructor(
    init?: Omit<Partial<OpenAI>, "session"> & {
      session?: LLMInstance | undefined;
      azure?: AzureClientOptions;
    },
  ) {
    super();
    this.model = init?.model ?? "gpt-4o";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalChatOptions = init?.additionalChatOptions;
    this.additionalSessionOptions = init?.additionalSessionOptions;
    this.apiKey =
      init?.session?.apiKey ?? init?.apiKey ?? getEnv("OPENAI_API_KEY");

    if (init?.azure || shouldUseAzure()) {
      const azureConfig = {
        ...getAzureConfigFromEnv({
          model: getAzureModel(this.model),
        }),
        ...init?.azure,
      };

      this.lazySession = async () =>
        init?.session ??
        import("openai").then(({ AzureOpenAI }) => {
          AzureOpenAI = AzureOpenAIWithUserAgent(AzureOpenAI);

          return new AzureOpenAI({
            maxRetries: this.maxRetries,
            timeout: this.timeout!,
            ...this.additionalSessionOptions,
            ...azureConfig,
          });
        });
    } else {
      this.lazySession = async () =>
        init?.session ??
        import("openai").then(({ OpenAI }) => {
          return new OpenAI({
            apiKey: this.apiKey,
            maxRetries: this.maxRetries,
            timeout: this.timeout!,
            ...this.additionalSessionOptions,
          });
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
          tool_calls: options.toolCall.map((toolCall) => {
            return {
              id: toolCall.id,
              type: "function",
              function: {
                name: toolCall.name,
                arguments:
                  typeof toolCall.input === "string"
                    ? toolCall.input
                    : JSON.stringify(toolCall.input),
              },
            };
          }),
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
    const baseRequestParams = <OpenAILLM.Chat.ChatCompletionCreateParams>{
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
    const response = await (
      await this.session
    ).chat.completions.create({
      ...baseRequestParams,
      stream: false,
    });

    const content = response.choices[0]!.message?.content ?? "";

    return {
      raw: response,
      message: {
        content,
        role: response.choices[0]!.message.role,
        options: response.choices[0]!.message?.tool_calls
          ? {
              toolCall: response.choices[0]!.message.tool_calls.map(
                (toolCall) => ({
                  id: toolCall.id,
                  name: toolCall.function.name,
                  input: toolCall.function.arguments,
                }),
              ),
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
    const stream: AsyncIterable<OpenAILLM.Chat.ChatCompletionChunk> = await (
      await this.session
    ).chat.completions.create({
      ...baseRequestParams,
      stream: true,
    });

    // TODO: add callback to streamConverter and use streamConverter here
    // this will be used to keep track of the current tool call, make sure input are valid json object.
    let currentToolCall: PartialToolCall | null = null;
    const toolCallMap = new Map<string, PartialToolCall>();
    for await (const part of stream) {
      if (part.choices.length === 0) {
        if (part.usage) {
          yield {
            raw: part,
            delta: "",
          };
        }
        continue;
      }
      const choice = part.choices[0]!;
      // skip parts that don't have any content
      if (
        !(
          choice.delta.content ||
          choice.delta.tool_calls ||
          choice.finish_reason
        )
      )
        continue;

      let shouldEmitToolCall: PartialToolCall | null = null;
      if (
        choice.delta.tool_calls?.[0]!.id &&
        currentToolCall &&
        choice.delta.tool_calls?.[0].id !== currentToolCall.id
      ) {
        shouldEmitToolCall = {
          ...currentToolCall,
          input: JSON.parse(currentToolCall.input),
        };
      }
      if (choice.delta.tool_calls?.[0]!.id) {
        currentToolCall = {
          name: choice.delta.tool_calls[0].function!.name!,
          id: choice.delta.tool_calls[0].id,
          input: choice.delta.tool_calls[0].function!.arguments!,
        };
        toolCallMap.set(choice.delta.tool_calls[0].id, currentToolCall);
      } else {
        if (choice.delta.tool_calls?.[0]!.function?.arguments) {
          currentToolCall!.input +=
            choice.delta.tool_calls[0].function.arguments;
        }
      }

      const isDone: boolean = choice.finish_reason !== null;

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
          ? { toolCall: [shouldEmitToolCall] }
          : currentToolCall
            ? {
                toolCall: [currentToolCall],
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
      function: tool.metadata.parameters
        ? {
            name: tool.metadata.name,
            description: tool.metadata.description,
            parameters: tool.metadata.parameters,
          }
        : {
            name: tool.metadata.name,
            description: tool.metadata.description,
          },
    };
  }
}
