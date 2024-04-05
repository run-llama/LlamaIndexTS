import type { Tokenizers } from "../GlobalsHelper.js";
import type { BaseTool } from "../types.js";

type LLMBaseEvent<
  Type extends string,
  Payload extends Record<string, unknown>,
> = CustomEvent<{
  payload: Payload;
}>;

export type LLMStartEvent = LLMBaseEvent<
  "llm-start",
  {
    messages: ChatMessage[];
  }
>;
export type LLMEndEvent = LLMBaseEvent<
  "llm-end",
  {
    response: ChatResponse;
  }
>;

declare module "llamaindex" {
  interface LlamaIndexEventMaps {
    "llm-start": LLMStartEvent;
    "llm-end": LLMEndEvent;
  }
}

/**
 * @internal
 */
export interface LLMChat<
  ExtraParams extends Record<string, unknown> = Record<string, unknown>,
> {
  chat(
    params:
      | LLMChatParamsStreaming<ExtraParams>
      | LLMChatParamsNonStreaming<ExtraParams>,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>>;
}

/**
 * Unified language model interface
 */
export interface LLM<
  ExtraParams extends Record<string, unknown> = Record<string, unknown>,
> extends LLMChat<ExtraParams> {
  metadata: LLMMetadata;
  /**
   * Get a chat response from the LLM
   */
  chat(
    params: LLMChatParamsStreaming<ExtraParams>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming<ExtraParams>): Promise<ChatResponse>;

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

export type MessageType =
  | "user"
  | "assistant"
  | "system"
  | "generic"
  | "function"
  | "memory"
  | "tool";

export interface ChatMessage {
  // TODO: use MessageContent
  content: any;
  role: MessageType;
  additionalKwargs?: Record<string, any>;
}

export interface ChatResponse {
  message: ChatMessage;
  raw?: Record<string, any>;
  additionalKwargs?: Record<string, any>;
}

export interface ChatResponseChunk {
  delta: string;
}

export interface CompletionResponse {
  text: string;
  raw?: Record<string, any>;
}

export interface LLMMetadata {
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  contextWindow: number;
  tokenizer: Tokenizers | undefined;
}

export interface LLMChatParamsBase<
  ExtraParams extends Record<string, unknown>,
> {
  messages: ChatMessage[];
  extraParams?: ExtraParams;
  tools?: BaseTool[];
  additionalKwargs?: Record<string, unknown>;
}

export interface LLMChatParamsStreaming<
  ExtraParams extends Record<string, unknown> = Record<string, unknown>,
> extends LLMChatParamsBase<ExtraParams> {
  stream: true;
}

export interface LLMChatParamsNonStreaming<
  ExtraParams extends Record<string, unknown> = Record<string, unknown>,
> extends LLMChatParamsBase<ExtraParams> {
  stream?: false;
}

export interface LLMCompletionParamsBase {
  prompt: any;
}

export interface LLMCompletionParamsStreaming extends LLMCompletionParamsBase {
  stream: true;
}

export interface LLMCompletionParamsNonStreaming
  extends LLMCompletionParamsBase {
  stream?: false | null;
}

export interface MessageContentDetail {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

/**
 * Extended type for the content of a message that allows for multi-modal messages.
 */
export type MessageContent = string | MessageContentDetail[];
