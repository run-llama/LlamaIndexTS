import type { ClientOptions } from "@anthropic-ai/sdk";
import { Anthropic as SDKAnthropic } from "@anthropic-ai/sdk";
import type {
  CacheControlEphemeral,
  Message,
  TextBlock,
} from "@anthropic-ai/sdk/resources/index";
import type {
  MessageCreateParams,
  MessageCreateParamsBase,
  MessageParam,
  Model,
  TextBlockParam,
  ThinkingBlock,
  Tool,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages";
import { wrapEventCaller, wrapLLMEvent } from "@llamaindex/core/decorator";
import type { JSONObject } from "@llamaindex/core/global";
import type {
  BaseTool,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  PartialToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { ToolCallLLM } from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import { isDeepEqual } from "remeda";

export class AnthropicSession {
  anthropic: SDKAnthropic;

  constructor(options: ClientOptions = {}) {
    if (!options.apiKey) {
      options.apiKey = getEnv("ANTHROPIC_API_KEY");
    }

    if (!options.apiKey) {
      throw new Error("Set Anthropic Key in ANTHROPIC_API_KEY env variable");
    }

    this.anthropic = new SDKAnthropic(options);
  }
}

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
const defaultAnthropicSession: {
  session: AnthropicSession;
  options: ClientOptions;
}[] = [];

/**
 * Get a session for the Anthropic API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
function getAnthropicSession(options: ClientOptions = {}) {
  let session = defaultAnthropicSession.find((session) => {
    return isDeepEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new AnthropicSession(options);
    defaultAnthropicSession.push({ session, options });
  }

  return session;
}

export const ALL_AVAILABLE_ANTHROPIC_LEGACY_MODELS = {
  "claude-2.1": {
    contextWindow: 200000,
  },
  "claude-2.0": {
    contextWindow: 100000,
  },
  "claude-instant-1.2": {
    contextWindow: 100000,
  },
};

export const ALL_AVAILABLE_V3_MODELS = {
  "claude-3-opus": { contextWindow: 200000 },
  "claude-3-opus-latest": { contextWindow: 200000 },
  "claude-3-opus-20240229": { contextWindow: 200000 },
  "claude-3-sonnet": { contextWindow: 200000 },
  "claude-3-sonnet-20240229": { contextWindow: 200000 },
  "claude-3-haiku": { contextWindow: 200000 },
  "claude-3-haiku-20240307": { contextWindow: 200000 },
};

export const ALL_AVAILABLE_V3_5_MODELS = {
  "claude-3-5-sonnet": { contextWindow: 200000 },
  "claude-3-5-sonnet-20241022": { contextWindow: 200000 },
  "claude-3-5-sonnet-20240620": { contextWindow: 200000 },
  "claude-3-5-sonnet-latest": { contextWindow: 200000 },
  "claude-3-5-haiku": { contextWindow: 200000 },
  "claude-3-5-haiku-latest": { contextWindow: 200000 },
  "claude-3-5-haiku-20241022": { contextWindow: 200000 },
};

export const ALL_AVAILABLE_V3_7_MODELS = {
  "claude-3-7-sonnet": { contextWindow: 200000 },
  "claude-3-7-sonnet-20250219": { contextWindow: 200000 },
  "claude-3-7-sonnet-latest": { contextWindow: 200000 },
};

export const ALL_AVAILABLE_V4_MODELS = {
  "claude-4-0-sonnet": { contextWindow: 200000 },
  "claude-4-sonnet-20240514": { contextWindow: 200000 },
  "claude-4-0-opus": { contextWindow: 200000 },
  "claude-4-1-opus": { contextWindow: 200000 },
  "claude-4-opus-20240514": { contextWindow: 200000 },
  "claude-sonnet-4-0": { contextWindow: 200000 },
  "claude-sonnet-4-20250514": { contextWindow: 200000 },
  "claude-opus-4-0": { contextWindow: 200000 },
  "claude-opus-4-20250514": { contextWindow: 200000 },
  "claude-4-sonnet-20250514": { contextWindow: 200000 },
  "claude-4-opus-20250514": { contextWindow: 200000 },
  "claude-opus-4-1-20250805": { contextWindow: 200000 },
};

export const ALL_AVAILABLE_ANTHROPIC_MODELS = {
  ...ALL_AVAILABLE_ANTHROPIC_LEGACY_MODELS,
  ...ALL_AVAILABLE_V3_MODELS,
  ...ALL_AVAILABLE_V3_5_MODELS,
  ...ALL_AVAILABLE_V3_7_MODELS,
  ...ALL_AVAILABLE_V4_MODELS,
} satisfies {
  [key in Model]: { contextWindow: number };
};

const AVAILABLE_ANTHROPIC_MODELS_WITHOUT_DATE: { [key: string]: string } = {
  "claude-3-opus": "claude-3-opus-20240229",
  "claude-3-sonnet": "claude-3-sonnet-20240229",
  "claude-3-haiku": "claude-3-haiku-20240307",
  "claude-3-5-sonnet": "claude-3-5-sonnet-20240620",
  "claude-3-7-sonnet": "claude-3-7-sonnet-20250219",
  "claude-4-0-sonnet": "claude-sonnet-4-20250514",
  "claude-4-0-opus": "claude-opus-4-20250514",
  "claude-4-1-opus": "claude-opus-4-1-20250805",
} as { [key in keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS]: string };

export type AnthropicAdditionalChatOptions = Pick<
  MessageCreateParamsBase,
  "thinking"
>;
export type AnthropicToolCallLLMMessageOptions = ToolCallLLMMessageOptions & {
  cache_control?: CacheControlEphemeral | null;
  thinking?: string | undefined;
  thinking_signature?: string | undefined;
};

export class Anthropic extends ToolCallLLM<
  AnthropicAdditionalChatOptions,
  AnthropicToolCallLLMMessageOptions
> {
  // Per completion Anthropic params
  model: keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS | ({} & string);
  temperature: number;
  topP?: number | undefined;
  maxTokens?: number | undefined;
  additionalChatOptions?: AnthropicAdditionalChatOptions | undefined;

  // Anthropic session params
  apiKey?: string | undefined;
  maxRetries: number;
  timeout?: number;
  session: AnthropicSession;

  constructor(init?: Partial<Anthropic>) {
    super();
    this.model = init?.model ?? "claude-3-opus";
    this.temperature = init?.temperature ?? 1; // default in anthropic is 1
    this.topP = init?.topP;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.apiKey = init?.apiKey ?? undefined;
    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalChatOptions = init?.additionalChatOptions;
    this.session =
      init?.session ??
      getAnthropicSession({
        apiKey: this.apiKey,
        maxRetries: this.maxRetries,
        timeout: this.timeout,
      });
  }

  get supportToolCall() {
    return this.model.includes("-3") || this.model.includes("-4");
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP ?? 0, // XXX: topP needs to be returned but might be undefined for Anthropic
      maxTokens: this.maxTokens,
      contextWindow:
        this.model in ALL_AVAILABLE_ANTHROPIC_MODELS
          ? ALL_AVAILABLE_ANTHROPIC_MODELS[
              this.model as keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS
            ].contextWindow
          : 200000,
      tokenizer: undefined,
      structuredOutput: false,
    };
  }

  getModelName = (model: string): string => {
    if (Object.keys(AVAILABLE_ANTHROPIC_MODELS_WITHOUT_DATE).includes(model)) {
      return AVAILABLE_ANTHROPIC_MODELS_WITHOUT_DATE[model]!;
    }
    return model;
  };

  parseToolInput = (input: string | JSONObject) => {
    if (typeof input === "object" && !Array.isArray(input)) return input;

    if (typeof input === "string") {
      const parsed = JSON.parse(input);
      if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    }

    console.error("Invalid tool input:", input);
    throw new Error("Tool input must be a dictionary");
  };

  formatMessages(
    messages: ChatMessage<AnthropicToolCallLLMMessageOptions>[],
  ): MessageParam[] {
    const formattedMessages = messages.flatMap((message) => {
      const options = message.options ?? {};
      if (message.role === "system") {
        // Skip system messages
        return [];
      }

      const content: MessageParam["content"] = [];

      if (options?.thinking) {
        if (options.thinking_signature == null) {
          throw new Error(
            "`thinking_signature` is required if `thinking` is provided",
          );
        }

        content.push({
          type: "thinking",
          thinking: options.thinking,
          signature: options.thinking_signature,
        });

        const text = extractText(message.content);
        if (text && text.trim().length > 0) {
          // don't add empty text blocks
          content.push({
            type: "text" as const,
            text: text,
          });
        }

        if (!("toolCall" in options)) {
          return { role: "assistant", content } satisfies MessageParam;
        }
      }

      if ("toolCall" in options) {
        if (content.length === 0 || !content.some((c) => c.type === "text")) {
          const text = extractText(message.content);
          if (text && text.trim().length > 0) {
            // don't add empty text blocks
            content.push({
              type: "text" as const,
              text: text,
            });
          }
        }

        content.push(
          ...options.toolCall.map((tool) => ({
            type: "tool_use" as const,
            id: tool.id,
            name: tool.name,
            input: this.parseToolInput(tool.input),
          })),
        );

        return { role: "assistant", content } satisfies MessageParam;
      }

      // Handle tool results
      if ("toolResult" in options) {
        const formattedMessage: MessageParam = {
          role: "user",
          content: [
            {
              type: "tool_result" as const,
              tool_use_id: options.toolResult.id,
              content: extractText(message.content),
            },
          ],
        };

        return formattedMessage;
      }

      // Handle regular messages
      if (typeof message.content === "string") {
        const role: "user" | "assistant" =
          message.role === "assistant" ? "assistant" : "user";

        return {
          role,
          content: message.content,
        } satisfies MessageParam;
      }

      // Handle multi-modal content
      const role: "user" | "assistant" =
        message.role === "assistant" ? "assistant" : "user";

      return {
        role,
        content: message.content.map((content) => {
          if (content.type === "text") {
            return {
              type: "text" as const,
              text: content.text,
            };
          }

          if (content.type === "file") {
            if (content.mimeType !== "application/pdf") {
              throw new Error(
                "Only supports mimeType `application/pdf` for file content.",
              );
            }

            return {
              type: "document" as const,
              source: {
                type: "base64" as const,
                media_type: content.mimeType,
                data: content.data,
              },
            };
          }

          if (content.type === "image_url") {
            return {
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: `image/${content.image_url.url.substring(
                  "data:image/".length,
                  content.image_url.url.indexOf(";base64"),
                )}` as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: content.image_url.url.substring(
                  content.image_url.url.indexOf(",") + 1,
                ),
              },
            };
          }
          throw new Error(`Unsupported content type: ${content.type}`);
        }),
      } satisfies MessageParam;
    });

    return this.mergeConsecutiveMessages(formattedMessages);
  }

  // Add helper method to prepare tools for API call
  private prepareToolsForAPI(tools: BaseTool[]): Tool[] {
    return tools.map((tool) => {
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
    });
  }

  private mergeConsecutiveMessages(messages: MessageParam[]): MessageParam[] {
    const result: MessageParam[] = [];

    for (let i = 0; i < messages.length; i++) {
      if (i === 0) {
        result.push(messages[i]!);
        continue;
      }

      const current = messages[i]!;
      const previous = result[result.length - 1]!;

      if (current.role === previous.role) {
        // Merge content based on type
        if (Array.isArray(previous.content)) {
          if (Array.isArray(current.content)) {
            previous.content.push(...current.content);
          } else {
            previous.content.push({
              type: "text",
              text: current.content,
            });
          }
        } else {
          if (Array.isArray(current.content)) {
            previous.content = [
              { type: "text", text: previous.content },
              ...current.content,
            ];
          } else {
            previous.content = `${previous.content}\n${current.content}`;
          }
        }
      } else {
        result.push(current);
      }
    }

    return result;
  }

  chat(
    params: LLMChatParamsStreaming<
      AnthropicAdditionalChatOptions,
      AnthropicToolCallLLMMessageOptions
    >,
  ): Promise<
    AsyncIterable<ChatResponseChunk<AnthropicToolCallLLMMessageOptions>>
  >;
  chat(
    params: LLMChatParamsNonStreaming<
      AnthropicAdditionalChatOptions,
      AnthropicToolCallLLMMessageOptions
    >,
  ): Promise<ChatResponse<AnthropicToolCallLLMMessageOptions>>;
  @wrapEventCaller
  @wrapLLMEvent
  async chat(
    params:
      | LLMChatParamsNonStreaming<
          AnthropicAdditionalChatOptions,
          AnthropicToolCallLLMMessageOptions
        >
      | LLMChatParamsStreaming<
          AnthropicAdditionalChatOptions,
          AnthropicToolCallLLMMessageOptions
        >,
  ): Promise<
    | ChatResponse<AnthropicToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<AnthropicToolCallLLMMessageOptions>>
  > {
    const { messages, stream, tools } = params;

    // Handle system messages
    let systemPrompt: string | TextBlockParam[] | null = null;
    const systemMessages = messages.filter(
      (message) => message.role === "system",
    );

    if (systemMessages.length > 0) {
      systemPrompt = systemMessages.map((message): TextBlockParam => {
        const textContent = extractText(message.content);
        if (message.options && "cache_control" in message.options) {
          return {
            type: "text" as const,
            text: textContent,
            cache_control: message.options
              .cache_control as CacheControlEphemeral,
          };
        }
        return {
          type: "text" as const,
          text: textContent,
        };
      });
    }

    const anthropic = this.session.anthropic;

    const apiParams: MessageCreateParamsBase = {
      model: this.getModelName(this.model),
      messages: this.mergeConsecutiveMessages(
        this.formatMessages(messages.filter((m) => m.role !== "system")),
      ),
      max_tokens: this.maxTokens ?? 4096,
      temperature: this.temperature,
      ...(this.topP ? { top_p: this.topP } : {}),
      ...(systemPrompt && { system: systemPrompt }),
      ...Object.assign(
        {},
        this.additionalChatOptions,
        params.additionalChatOptions,
      ),
    };

    if (tools?.length) {
      Object.assign(apiParams, {
        tools: this.prepareToolsForAPI(tools),
      });
    }

    if (stream) {
      return this.streamChat(anthropic, apiParams);
    }

    const response = (await anthropic.messages.create(apiParams)) as Message;

    const thinkingBlock = response.content.find(
      (content): content is ThinkingBlock => content.type === "thinking",
    );

    const toolUseBlock = response.content.filter(
      (content): content is ToolUseBlock => content.type === "tool_use",
    );

    const toolCall =
      toolUseBlock.length > 0
        ? {
            toolCall: toolUseBlock.map((block) => ({
              id: block.id,
              name: block.name,
              input:
                typeof block.input === "string"
                  ? block.input
                  : JSON.stringify(block.input),
            })),
          }
        : {};

    return {
      raw: response,
      message: {
        content: response.content
          .filter(
            (content): content is TextBlock =>
              content.type === "text" && content.text?.trim().length > 0,
          )
          .map((content) => ({
            type: "text" as const,
            text: content.text,
          })),
        role: "assistant",
        options: {
          ...toolCall,
          thinking: thinkingBlock?.thinking,
          thinking_signature: thinkingBlock?.signature,
        },
      },
    };
  }

  @wrapEventCaller
  protected async *streamChat(
    anthropic: SDKAnthropic,
    params: MessageCreateParams,
  ): AsyncIterable<ChatResponseChunk<AnthropicToolCallLLMMessageOptions>> {
    const stream = await anthropic.messages.create({
      ...params,
      stream: true,
    });

    let currentToolCall: PartialToolCall | null = null;

    for await (const part of stream) {
      const textContent =
        part.type === "content_block_delta" && part.delta.type === "text_delta"
          ? part.delta.text
          : undefined;

      const thinking =
        part.type === "content_block_delta" &&
        part.delta.type === "thinking_delta"
          ? part.delta.thinking
          : undefined;

      const thinkingSignature =
        part.type === "content_block_delta" &&
        part.delta.type === "signature_delta"
          ? part.delta.signature
          : undefined;

      if (
        part.type === "content_block_start" &&
        part.content_block.type === "tool_use"
      ) {
        currentToolCall = {
          id: part.content_block.id,
          name: part.content_block.name,
          input: "",
        };
        yield {
          raw: part,
          delta: "",
          options: {
            toolCall: [currentToolCall],
          },
        };
        continue;
      }

      if (
        part.type === "content_block_delta" &&
        part.delta.type === "input_json_delta" &&
        currentToolCall
      ) {
        currentToolCall.input += part.delta.partial_json;
        yield {
          raw: part,
          delta: "",
          options: {
            toolCall: [currentToolCall],
          },
        };
        continue;
      }

      if (part.type === "content_block_stop" && currentToolCall) {
        yield {
          raw: part,
          delta: "",
          options: {
            toolCall: [currentToolCall],
          },
        };
        currentToolCall = null;
        continue;
      }

      if (!textContent && !thinking && !thinkingSignature) continue;

      yield {
        raw: part,
        delta: textContent ?? "",
        options: {
          thinking: thinking,
          thinking_signature: thinkingSignature,
        },
      };
    }
    return;
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

/**
 * Convenience function to create a new Anthropic instance.
 * @param init - Optional initialization parameters for the Anthropic instance.
 * @returns A new Anthropic instance.
 */
export const anthropic = (init?: ConstructorParameters<typeof Anthropic>[0]) =>
  new Anthropic(init);
