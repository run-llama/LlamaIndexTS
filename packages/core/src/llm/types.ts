import { Tokenizers } from "../GlobalsHelper";
import { Event } from "../callbacks/CallbackManager";

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
  | "memory";

export interface ChatMessage {
  // TODO: use MessageContent
  content: any;
  role: MessageType;
}

export interface ChatResponse {
  message: ChatMessage;
  raw?: Record<string, any>;
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
