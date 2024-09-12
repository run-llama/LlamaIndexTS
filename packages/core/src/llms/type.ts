import type { Tokenizers } from "@llamaindex/env";
import type { JSONSchemaType } from "ajv";
import type { JSONObject, JSONValue } from "../global/type";

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

export type TextChatMessage<AdditionalMessageOptions extends object = object> =
  {
    content: string;
    role: MessageType;
    options?: undefined | AdditionalMessageOptions;
  };

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
  maxTokens?: number | undefined;
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
  stream?: false | null | undefined;
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
  input: JSONObject;
  id: string;
};

// happened in streaming response, the tool call is not ready yet
export type PartialToolCall = {
  name: string;
  id: string;
  // input is not ready yet, JSON.parse(input) will throw an error
  input: string;
};

export type ToolResult = {
  id: string;
  result: string;
  isError: boolean;
};

export type ToolCallOptions = {
  toolCall: (ToolCall | PartialToolCall)[];
};

export type ToolResultOptions = {
  toolResult: ToolResult;
};

export type ToolCallLLMMessageOptions =
  | ToolResultOptions
  | ToolCallOptions
  | {};

type Known =
  | { [key: string]: Known }
  | [Known, ...Known[]]
  | Known[]
  | number
  | string
  | boolean
  | null;

export type ToolMetadata<
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> = {
  description: string;
  name: string;
  /**
   * OpenAI uses JSON Schema to describe the parameters that a tool can take.
   * @link https://json-schema.org/understanding-json-schema
   */
  parameters?: Parameters;
};

/**
 * Simple Tool interface. Likely to change.
 */
export interface BaseTool<Input = any> {
  /**
   * This could be undefined if the implementation is not provided,
   *  which might be the case when communicating with a llm.
   *
   * @return {JSONValue | Promise<JSONValue>} The output of the tool.
   */
  call?: (input: Input) => JSONValue | Promise<JSONValue>;
  metadata: // if user input any, we cannot check the schema
  Input extends Known ? ToolMetadata<JSONSchemaType<Input>> : ToolMetadata;
}

export type BaseToolWithCall<Input = any> = Omit<BaseTool<Input>, "call"> & {
  call: NonNullable<Pick<BaseTool<Input>, "call">["call"]>;
};

export type ToolOutput = {
  tool: BaseTool | undefined;
  // all of existing function calling LLMs only support object input
  input: JSONObject;
  output: JSONValue;
  isError: boolean;
};
