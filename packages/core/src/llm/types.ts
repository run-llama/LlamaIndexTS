import type { Tokenizers } from "../GlobalsHelper.js";
import type { BaseTool, UUID } from "../types.js";

type LLMBaseEvent<Payload extends Record<string, unknown>> = CustomEvent<{
  payload: Payload;
}>;

export type LLMStartEvent = LLMBaseEvent<{
  id: UUID;
  messages: ChatMessage[];
}>;
export type LLMToolCallEvent = LLMBaseEvent<{
  // fixme: id is missing in the context
  // id: UUID;
  toolCall: Omit<ToolCallOptions["toolCall"], "id">;
}>;
export type LLMEndEvent = LLMBaseEvent<{
  id: UUID;
  response: ChatResponse;
}>;
export type LLMStreamEvent = LLMBaseEvent<{
  id: UUID;
  chunk: ChatResponseChunk;
}>;

/**
 * @internal
 */
export interface LLMChat<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
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
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
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

export type MessageType = "user" | "assistant" | "system" | "memory";

export type ChatMessage<AdditionalMessageOptions extends object = object> = {
  content: MessageContent;
  role: MessageType;
  options?: undefined | AdditionalMessageOptions;
};

export interface ChatResponse<
  AdditionalMessageOptions extends object = object,
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
  AdditionalMessageOptions extends object = object,
> = {
  raw: object | null;
  delta: string;
  options?: undefined | AdditionalMessageOptions;
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
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
> {
  messages: ChatMessage<AdditionalMessageOptions>[];
  additionalChatOptions?: AdditionalChatOptions;
  tools?: BaseTool[];
}

export interface LLMChatParamsStreaming<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
> extends LLMChatParamsBase<AdditionalChatOptions, AdditionalMessageOptions> {
  stream: true;
}

export interface LLMChatParamsNonStreaming<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
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

export type ToolCall = {
  name: string;
  input: unknown;
  id: string;
};

export type ToolResult = {
  id: string;
  result: string;
  isError: boolean;
};

export type ToolCallOptions = {
  toolCall: ToolCall;
};

export type ToolResultOptions = {
  toolResult: ToolResult;
};
