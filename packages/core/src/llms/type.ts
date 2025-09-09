import type { Logger } from "@llamaindex/env";
import type { Tokenizers } from "@llamaindex/env/tokenizers";
import type { JSONSchemaType } from "ajv";
import type { JSONObject, JSONValue } from "../global";
import type { ModalityType } from "../schema";
import type { ZodSchema } from "../utils";

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

export type MessageType =
  | "user"
  | "assistant"
  | "system"
  | "memory"
  | "developer";

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

export interface ExecResponse<
  AdditionalMessageOptions extends object = object,
> {
  newMessages: ChatMessage<AdditionalMessageOptions>[];
  toolCalls: ToolCall[];
}

export interface ExecStreamResponse<
  AdditionalMessageOptions extends object = object,
> {
  stream: AsyncIterable<ChatResponseChunk<AdditionalMessageOptions>>;
  // this is a function as while streaming, the assistant message is not ready yet - can be called after the stream is done
  newMessages(): ChatMessage<AdditionalMessageOptions>[];
  toolCalls: ToolCall[];
}

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
  structuredOutput: boolean;
};

export interface LLMChatParamsBase<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
> {
  messages: ChatMessage<AdditionalMessageOptions>[];
  additionalChatOptions?: AdditionalChatOptions | undefined;
  tools?: BaseTool[] | undefined;
  responseFormat?: ZodSchema | object | undefined;
  logger?: Logger | undefined;
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
  responseFormat?: ZodSchema | object;
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
  detail?: "high" | "low" | "auto";
};

export type MessageContentAudioDetail = {
  type: "audio";
  // this is a base64 encoded string
  data: string;
  mimeType: string;
};

export type MessageContentVideoDetail = {
  type: "video";
  // this is a base64 encoded string
  data: string;
  mimeType: string;
};

export type MessageContentImageDataDetail = {
  type: "image";
  // this is a base64 encoded string
  data: string;
  mimeType: string;
};

export type MessageContentFileDetail = {
  type: "file";
  // this is a base64 encoded string
  data: string;
  mimeType: string;
};

export type MessageContentDetail =
  | MessageContentTextDetail
  | MessageContentImageDetail
  | MessageContentAudioDetail
  | MessageContentVideoDetail
  | MessageContentImageDataDetail
  | MessageContentFileDetail;

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
  | object;

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
export interface BaseTool<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input = any,
> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface AudioConfig {
  stream?: MediaStream;
  onTrack?: (track: MediaStream | null) => void;
}

export interface LiveConnectConfig {
  tools?: BaseTool[];
  responseModality?: ModalityType[];
  systemInstruction?: string;
  audioConfig?: AudioConfig;
}
