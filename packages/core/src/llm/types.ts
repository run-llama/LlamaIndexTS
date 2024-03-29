import type { Tokenizers } from "../GlobalsHelper.js";
import { type Event, type Timeline } from "../callbacks/CallbackManager.js";

/**
 * @internal do not use this type directly
 */
type LLMBaseEvent<
  Type extends string,
  Payload extends Record<string, unknown>,
> = CustomEvent<{
  timeline: Timeline;
  type: Type;
  payload: Payload;
}>;

export type ChatStartEvent = LLMBaseEvent<
  "chat-start",
  {
    id: string;
    messages: ChatMessage[];
  }
>;
export type ChatProgressEvent = LLMBaseEvent<
  "chat-progress",
  {
    id: string;
    messages: ChatMessage[];
  }
>;
export type ChatEndEvent = LLMBaseEvent<
  "chat-end",
  {
    id: string;
    response: ChatResponse;
  }
>;

declare module "llamaindex" {
  interface LlamaIndexEventMaps {
    "chat-start": ChatStartEvent;
    "chat-end": ChatEndEvent;
  }
}

/**
 * Unified language model interface
 */
export interface LLM {
  metadata: LLMMetadata;
  /**
   * Get a chat response from the LLM
   *
   * @param params
   */
  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;

  /**
   * Get a prompt completion from the LLM
   * @param params
   */
  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;

  /**
   * Calculates the number of tokens needed for the given chat messages
   */
  tokens(messages: ChatMessage[]): number;
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

export interface LLMChatParamsBase {
  messages: ChatMessage[];
  parentEvent?: Event;
  extraParams?: Record<string, any>;
  tools?: any;
  toolChoice?: any;
  additionalKwargs?: Record<string, any>;
}

export interface LLMChatParamsStreaming extends LLMChatParamsBase {
  stream: true;
}

export interface LLMChatParamsNonStreaming extends LLMChatParamsBase {
  stream?: false | null;
}

export interface LLMCompletionParamsBase {
  prompt: any;
  parentEvent?: Event;
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
