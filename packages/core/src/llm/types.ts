import type { Tokenizers } from "../GlobalsHelper.js";
import type { PlaceholderRecord } from "../internal/utils.js";
import type { BaseTool, UUID } from "../types.js";

type LLMBaseEvent<
  Type extends string,
  Payload extends Record<string, unknown>,
> = CustomEvent<{
  payload: Payload;
}>;

export type LLMStartEvent = LLMBaseEvent<
  "llm-start",
  {
    id: UUID;
    messages: ChatMessage[];
  }
>;
export type LLMEndEvent = LLMBaseEvent<
  "llm-end",
  {
    id: UUID;
    response: ChatResponse;
  }
>;
export type LLMStreamEvent = LLMBaseEvent<
  "llm-stream",
  {
    id: UUID;
    chunk: ChatResponseChunk;
  }
>;

/**
 * @internal
 */
export interface LLMChat<
  AdditionalChatOptions extends Record<string, unknown> = PlaceholderRecord,
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> {
  chat(
    params:
      | LLMChatParamsStreaming<AdditionalChatOptions>
      | LLMChatParamsNonStreaming<AdditionalChatOptions>,
  ): Promise<
    | ChatResponse<AdditionalMessageOptions>
    | AsyncIterable<ChatResponseChunk<AdditionalMessageOptions>>
  >;
}

/**
 * Unified language model interface
 */
export interface LLM<
  AdditionalChatOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
  AdditionalMessageOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> extends LLMChat<AdditionalChatOptions> {
  metadata: LLMMetadata;
  /**
   * Get a chat response from the LLM
   */
  chat(
    params: LLMChatParamsStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<ChatResponse<AdditionalMessageOptions>>;

  /**
   * Get a prompt completion from the LLM
   */
  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
}

// todo: remove "generic", "function", "memory";
export type MessageType =
  | "user"
  | "assistant"
  | "system"
  /**
   * @deprecated
   */
  | "generic"
  /**
   * @deprecated
   */
  | "function"
  /**
   * @deprecated
   */
  | "memory"
  | "tool";

export type ChatMessage<
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> = AdditionalMessageOptions extends PlaceholderRecord
  ? {
      content: MessageContent;
      role: MessageType;
      options?: Record<string, unknown>;
    }
  : {
      content: MessageContent;
      role: MessageType;
      options:
        | AdditionalMessageOptions
        // always allow empty options
        | {};
    };

export interface ChatResponse<
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> {
  message: ChatMessage<AdditionalMessageOptions>;
  /**
   * Raw response from the LLM
   *
   * If LLM response an iterable of chunks, this will be an array of those chunks
   */
  raw: object | null;
}

export type ChatResponseChunk<
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> = AdditionalMessageOptions extends PlaceholderRecord
  ? {
      raw: object | null;
      delta: string;
      options?: Record<string, unknown>;
    }
  : {
      raw: object | null;
      delta: string;
      options: AdditionalMessageOptions;
    };

export interface CompletionResponse {
  text: string;
  /**
   * Raw response from the LLM
   *
   * It's possible that this is `null` if the LLM response an iterable of chunks
   */
  raw: object | null;
}

export type LLMMetadata = {
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  contextWindow: number;
  tokenizer: Tokenizers | undefined;
};

export interface LLMChatParamsBase<
  AdditionalChatOptions extends Record<string, unknown> = PlaceholderRecord,
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> {
  messages: ChatMessage<AdditionalMessageOptions>[];
  additionalChatOptions?: AdditionalChatOptions;
  tools?: BaseTool[];
  additionalKwargs?: Record<string, unknown>;
}

export interface LLMChatParamsStreaming<
  AdditionalChatOptions extends Record<string, unknown> = PlaceholderRecord,
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> extends LLMChatParamsBase<AdditionalChatOptions, AdditionalMessageOptions> {
  stream: true;
}

export interface LLMChatParamsNonStreaming<
  AdditionalChatOptions extends Record<string, unknown> = PlaceholderRecord,
  AdditionalMessageOptions extends Record<string, unknown> = PlaceholderRecord,
> extends LLMChatParamsBase<AdditionalChatOptions, AdditionalMessageOptions> {
  stream?: false;
}

export interface LLMCompletionParamsBase {
  prompt: MessageContent;
}

export interface LLMCompletionParamsStreaming extends LLMCompletionParamsBase {
  stream: true;
}

export interface LLMCompletionParamsNonStreaming
  extends LLMCompletionParamsBase {
  stream?: false | null;
}

export type MessageContentTextDetail = {
  type: "text";
  text: string;
};

export type MessageContentImageDetail = {
  type: "image_url";
  image_url: { url: string };
};

export type MessageContentDetail =
  | MessageContentTextDetail
  | MessageContentImageDetail;

/**
 * Extended type for the content of a message that allows for multi-modal messages.
 */
export type MessageContent = string | MessageContentDetail[];

interface Function {
  arguments: string;
  name: string;
}

export interface MessageToolCall {
  id: string;
  function: Function;
  type: "function";
}
