import type { Tokenizers } from "../GlobalsHelper.js";
import type { BaseTool, MessageContent, UUID } from "../types.js";

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
  AdditionalChatOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> extends LLMChat<AdditionalChatOptions> {
  metadata: LLMMetadata;
  /**
   * Get a chat response from the LLM
   */
  chat(
    params: LLMChatParamsStreaming<AdditionalChatOptions>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<AdditionalChatOptions>,
  ): Promise<ChatResponse>;

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
  content: MessageContent;
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
  additionalKwargs?: Record<string, any>;
}

export interface CompletionResponse {
  text: string;
  raw?: Record<string, any>;
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
  AdditionalChatOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> {
  messages: ChatMessage[];
  additionalChatOptions?: AdditionalChatOptions;
  tools?: BaseTool[];
  additionalKwargs?: Record<string, unknown>;
}

export interface LLMChatParamsStreaming<
  AdditionalChatOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> extends LLMChatParamsBase<AdditionalChatOptions> {
  stream: true;
}

export interface LLMChatParamsNonStreaming<
  AdditionalChatOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> extends LLMChatParamsBase<AdditionalChatOptions> {
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

interface Function {
  arguments: string;
  name: string;
}

export interface MessageToolCall {
  id: string;
  function: Function;
  type: "function";
}
