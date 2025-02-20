import type { ClientOptions } from "@anthropic-ai/sdk";
import { Anthropic as SDKAnthropic } from "@anthropic-ai/sdk";
import type {
  BetaCacheControlEphemeral,
  BetaTextBlockParam,
} from "@anthropic-ai/sdk/resources/beta/index";
import type { TextBlock } from "@anthropic-ai/sdk/resources/index";
import type {
  MessageParam,
  Model,
  Tool,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages";
import { wrapLLMEvent } from "@llamaindex/core/decorator";
import type { JSONObject } from "@llamaindex/core/global";
import type {
  BaseTool,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
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
export function getAnthropicSession(options: ClientOptions = {}) {
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

export const ALL_AVAILABLE_ANTHROPIC_MODELS = {
  ...ALL_AVAILABLE_ANTHROPIC_LEGACY_MODELS,
  ...ALL_AVAILABLE_V3_MODELS,
  ...ALL_AVAILABLE_V3_5_MODELS,
} satisfies {
  [key in Model]: { contextWindow: number };
};

const AVAILABLE_ANTHROPIC_MODELS_WITHOUT_DATE: { [key: string]: string } = {
  "claude-3-opus": "claude-3-opus-20240229",
  "claude-3-sonnet": "claude-3-sonnet-20240229",
  "claude-3-haiku": "claude-3-haiku-20240307",
  "claude-3-5-sonnet": "claude-3-5-sonnet-20240620",
} as { [key in keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS]: string };

export type AnthropicAdditionalChatOptions = object;
export type AnthropicToolCallLLMMessageOptions = ToolCallLLMMessageOptions & {
  cache_control?: BetaCacheControlEphemeral | null;
};

export class Anthropic extends ToolCallLLM<
  AnthropicAdditionalChatOptions,
  AnthropicToolCallLLMMessageOptions
> {
  // Per completion Anthropic params
  model: keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS | ({} & string);
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;

  // Anthropic session params
  apiKey?: string | undefined;
  maxRetries: number;
  timeout?: number;
  session: AnthropicSession;

  constructor(init?: Partial<Anthropic>) {
    super();
    this.model = init?.model ?? "claude-3-opus";
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

  get supportToolCall() {
    return this.model.startsWith("claude-3");
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow:
        this.model in ALL_AVAILABLE_ANTHROPIC_MODELS
          ? ALL_AVAILABLE_ANTHROPIC_MODELS[
              this.model as keyof typeof ALL_AVAILABLE_ANTHROPIC_MODELS
            ].contextWindow
          : 200000,
      tokenizer: undefined,
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
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): MessageParam[] {
    const formattedMessages = messages.flatMap((message) => {
      const options = message.options ?? {};
      if (message.role === "system") {
        // Skip system messages
        return [];
      }

      if ("toolCall" in options) {
        const text = extractText(message.content);

        const content: MessageParam["content"] = [];
        if (text && text.trim().length > 0) {
          // don't add empty text blocks
          content.push({
            type: "text" as const,
            text: text,
          });
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
  @wrapLLMEvent
  async chat(
    params:
      | LLMChatParamsNonStreaming<AnthropicToolCallLLMMessageOptions>
      | LLMChatParamsStreaming<AnthropicToolCallLLMMessageOptions>,
  ): Promise<
    | ChatResponse<AnthropicToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<AnthropicToolCallLLMMessageOptions>>
  > {
    const { messages, stream, tools } = params;

    // Handle system messages
    let systemPrompt: string | BetaTextBlockParam[] | null = null;
    const systemMessages = messages.filter(
      (message) => message.role === "system",
    );

    if (systemMessages.length > 0) {
      systemPrompt = systemMessages.map((message): BetaTextBlockParam => {
        const textContent = extractText(message.content);
        if (message.options && "cache_control" in message.options) {
          return {
            type: "text" as const,
            text: textContent,
            cache_control: message.options
              .cache_control as BetaCacheControlEphemeral,
          };
        }
        return {
          type: "text" as const,
          text: textContent,
        };
      });
    }

    const beta =
      Array.isArray(systemPrompt) &&
      systemPrompt.some((message) => "cache_control" in message);

    let anthropic = this.session.anthropic;
    if (beta) {
      // @ts-expect-error type casting
      anthropic = anthropic.beta.promptCaching;
    }

    if (stream) {
      if (tools) {
        console.error("Tools are not supported in streaming mode");
      }
      return this.streamChat(
        messages.filter((m) => m.role !== "system"),
        systemPrompt,
        anthropic,
      );
    }

    const apiParams = {
      model: this.getModelName(this.model),
      messages: this.mergeConsecutiveMessages(
        this.formatMessages(messages.filter((m) => m.role !== "system")),
      ),
      max_tokens: this.maxTokens ?? 4096,
      temperature: this.temperature,
      top_p: this.topP,
      ...(systemPrompt && { system: systemPrompt }),
    };

    if (tools?.length) {
      Object.assign(apiParams, {
        tools: this.prepareToolsForAPI(tools),
      });
    }

    const response = await anthropic.messages.create(apiParams);

    const toolUseBlock = response.content.filter(
      (content): content is ToolUseBlock => content.type === "tool_use",
    );

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
        options:
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
            : {},
      },
    };
  }

  protected async *streamChat(
    messages: ChatMessage<AnthropicToolCallLLMMessageOptions>[],
    systemPrompt: string | Array<BetaTextBlockParam> | null,
    anthropic: SDKAnthropic,
  ): AsyncIterable<ChatResponseChunk<AnthropicToolCallLLMMessageOptions>> {
    const stream = await anthropic.messages.create({
      model: this.getModelName(this.model),
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
        part.type === "content_block_delta"
          ? part.delta.type === "text_delta"
            ? part.delta.text
            : part.delta
          : undefined;

      if (typeof content !== "string") continue;

      idx_counter++;
      yield {
        raw: part,
        delta: content,
        options: {},
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
