import { wrapEventCaller, wrapLLMEvent } from "@llamaindex/core/decorator";
import {
  ToolCallLLM,
  type BaseTool,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type MessageType,
  type PartialToolCall,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import { Tokenizers } from "@llamaindex/env/tokenizers";
import type {
  ClientOptions as OpenAIClientOptions,
  OpenAI as OpenAILLM,
} from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatModel } from "openai/resources/chat/chat";
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionContentPart,
  ChatCompletionMessageToolCall,
  ChatCompletionRole,
  ChatCompletionSystemMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat/completions";
import type {
  ChatCompletionMessageParam,
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
} from "openai/resources/index.js";
import { OpenAILive } from "./live.js";
import {
  ALL_AVAILABLE_OPENAI_MODELS,
  isFunctionCallingModel,
  isReasoningModel,
  isTemperatureSupported,
  type LLMInstance,
  type OpenAIAdditionalChatOptions,
  type OpenAIAdditionalMetadata,
  type OpenAIVoiceNames,
} from "./utils.js";

export class OpenAI extends ToolCallLLM<OpenAIAdditionalChatOptions> {
  model:
    | ChatModel
    // string & {} is a hack to allow any string, but still give autocomplete
    | (string & {});
  temperature: number;
  reasoningEffort?: "low" | "medium" | "high" | undefined;
  topP: number;
  maxTokens?: number | undefined;
  additionalChatOptions?: OpenAIAdditionalChatOptions | undefined;

  // OpenAI session params
  apiKey?: string | undefined = undefined;
  baseURL?: string | undefined = undefined;
  maxRetries: number;
  timeout?: number;
  additionalSessionOptions?:
    | undefined
    | Omit<Partial<OpenAIClientOptions>, "apiKey" | "maxRetries" | "timeout">;
  private voiceName?: OpenAIVoiceNames | undefined;
  private _live: OpenAILive | undefined;

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
      voiceName?: OpenAIVoiceNames | undefined;
    },
  ) {
    super();

    this.model = init?.model ?? "gpt-4o";
    this.temperature = init?.temperature ?? 0.1;
    this.reasoningEffort = isReasoningModel(this.model)
      ? init?.reasoningEffort
      : undefined;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalChatOptions = init?.additionalChatOptions;
    this.additionalSessionOptions = init?.additionalSessionOptions;
    this.apiKey = init?.session?.apiKey ?? init?.apiKey;
    this.baseURL = init?.session?.baseURL ?? init?.baseURL;
    this.voiceName = init?.voiceName;
    this.lazySession = async () =>
      init?.session ??
      import("openai").then(({ OpenAI }) => {
        return new OpenAI({
          apiKey: this.apiKey ?? getEnv("OPENAI_API_KEY"),
          baseURL: this.baseURL ?? getEnv("OPENAI_BASE_URL"),
          maxRetries: this.maxRetries,
          timeout: this.timeout!,
          ...this.additionalSessionOptions,
        });
      });
  }

  get supportToolCall() {
    return isFunctionCallingModel(this);
  }

  get live(): OpenAILive {
    if (!this._live) {
      this._live = new OpenAILive({
        apiKey: this.apiKey,
        voiceName: this.voiceName,
        model: this.model as ChatModel,
      });
    }
    return this._live;
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
      structuredOutput: true,
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
        if (typeof message.content === "string") {
          return { role: "user", content: message.content };
        }

        return {
          role: "user",
          content: message.content.map((item, index) => {
            // Handle MessageContentMediaDetail (audio, video, image)
            if (
              "data" in item &&
              "mimeType" in item &&
              (item.type === "audio" ||
                item.type === "video" ||
                item.type === "image")
            ) {
              if (item.type === "audio" || item.type === "video") {
                throw new Error("Audio and video are not supported");
              }
              // Convert image type to file format for OpenAI
              return {
                type: "file",
                file: {
                  file_data: `data:${item.mimeType};base64,${item.data}`,
                  filename: `image-${index}.${item.mimeType.split("/")[1] || "png"}`,
                },
              } satisfies ChatCompletionContentPart.File;
            }

            if (item.type === "file") {
              if (item.mimeType !== "application/pdf") {
                throw new Error("Only PDF files are supported");
              }
              const base64Data = item.data;
              return {
                type: "file",
                file: {
                  file_data: `data:${item.mimeType};base64,${base64Data}`,
                  filename: `part-${index}.pdf`,
                },
              } satisfies ChatCompletionContentPart.File;
            }

            // Keep other types as is (text, image_url, etc.)
            return item;
          }) as ChatCompletionContentPart[],
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
    const { messages, stream, tools, responseFormat, additionalChatOptions } =
      params;
    const baseRequestParams = <OpenAILLM.Chat.ChatCompletionCreateParams>{
      model: this.model,
      temperature: this.temperature,
      reasoning_effort: this.reasoningEffort,
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

    if (!isTemperatureSupported(baseRequestParams.model))
      delete baseRequestParams.temperature;

    //add response format for the structured output
    if (responseFormat && this.metadata.structuredOutput) {
      // Check if it's a ZodType by looking for its parse and safeParse methods
      if ("parse" in responseFormat && "safeParse" in responseFormat)
        baseRequestParams.response_format = zodResponseFormat(
          responseFormat,
          "response_format",
        );
      else {
        baseRequestParams.response_format = responseFormat as
          | ResponseFormatJSONObject
          | ResponseFormatJSONSchema;
      }
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
      const choice = part.choices[0]!;
      // skip parts that don't have any content
      if (
        !(
          choice?.delta?.content ||
          choice?.delta?.tool_calls ||
          choice?.finish_reason
        )
      ) {
        if (part.usage) {
          yield {
            raw: part,
            delta: "",
          };
        }
        continue;
      }

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

/**
 * Convenience function to create a new OpenAI instance.
 * @param init - Optional initialization parameters for the OpenAI instance.
 * @returns A new OpenAI instance.
 */
export const openai = (init?: ConstructorParameters<typeof OpenAI>[0]) =>
  new OpenAI(init);
