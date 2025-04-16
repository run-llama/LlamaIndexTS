import type { LLM, PartialToolCall } from "@llamaindex/core/llms";
import { AzureOpenAI as AzureOpenAILLM, OpenAI as OpenAILLM } from "openai";
import type { ChatModel } from "openai/resources.mjs";
import { OpenAI } from "./llm";

export const GPT4_MODELS = {
  "chatgpt-4o-latest": {
    contextWindow: 128000,
  },
  "gpt-4.5-preview": { contextWindow: 128000 },
  "gpt-4.5-preview-2025-02-27": { contextWindow: 128000 },
  "gpt-4": { contextWindow: 8192 },
  "gpt-4-32k": { contextWindow: 32768 },
  "gpt-4-32k-0613": { contextWindow: 32768 },
  "gpt-4-turbo": { contextWindow: 128000 },
  "gpt-4-turbo-preview": { contextWindow: 128000 },
  "gpt-4-1106-preview": { contextWindow: 128000 },
  "gpt-4-0125-preview": { contextWindow: 128000 },
  "gpt-4-vision-preview": { contextWindow: 128000 },
  "gpt-4o": { contextWindow: 128000 },
  "gpt-4o-2024-05-13": { contextWindow: 128000 },
  "gpt-4o-mini": { contextWindow: 128000 },
  "gpt-4o-mini-2024-07-18": { contextWindow: 128000 },
  "gpt-4o-2024-08-06": { contextWindow: 128000 },
  "gpt-4o-2024-09-14": { contextWindow: 128000 },
  "gpt-4o-2024-10-14": { contextWindow: 128000 },
  "gpt-4-0613": { contextWindow: 128000 },
  "gpt-4-turbo-2024-04-09": { contextWindow: 128000 },
  "gpt-4-0314": { contextWindow: 128000 },
  "gpt-4-32k-0314": { contextWindow: 32768 },
  "gpt-4o-realtime-preview": {
    contextWindow: 128000,
  },
  "gpt-4o-realtime-preview-2024-10-01": {
    contextWindow: 128000,
  },
  "gpt-4o-audio-preview": {
    contextWindow: 128000,
  },
  "gpt-4o-audio-preview-2024-10-01": {
    contextWindow: 128000,
  },
  "gpt-4o-2024-11-20": {
    contextWindow: 128000,
  },
  "gpt-4o-audio-preview-2024-12-17": {
    contextWindow: 128000,
  },
  "gpt-4o-mini-audio-preview": {
    contextWindow: 128000,
  },
  "gpt-4o-mini-audio-preview-2024-12-17": {
    contextWindow: 128000,
  },
  "gpt-4o-search-preview": { contextWindow: 128000 },
  "gpt-4o-mini-search-preview": { contextWindow: 128000 },
  "gpt-4o-search-preview-2025-03-11": { contextWindow: 128000 },
  "gpt-4o-mini-search-preview-2025-03-11": { contextWindow: 128000 },
  "gpt-4.1": { contextWindow: 10 ** 6 },
  "gpt-4.1-mini": { contextWindow: 10 ** 6 },
  "gpt-4.1-nano": { contextWindow: 10 ** 6 },
};

// NOTE we don't currently support gpt-3.5-turbo-instruct and don't plan to in the near future
export const GPT35_MODELS = {
  "gpt-3.5-turbo": { contextWindow: 16385 },
  "gpt-3.5-turbo-0613": { contextWindow: 4096 },
  "gpt-3.5-turbo-16k": { contextWindow: 16385 },
  "gpt-3.5-turbo-16k-0613": { contextWindow: 16385 },
  "gpt-3.5-turbo-1106": { contextWindow: 16385 },
  "gpt-3.5-turbo-0125": { contextWindow: 16385 },
  "gpt-3.5-turbo-0301": { contextWindow: 16385 },
};

export const O1_MODELS = {
  "o1-preview": {
    contextWindow: 128000,
  },
  "o1-preview-2024-09-12": {
    contextWindow: 128000,
  },
  "o1-mini": {
    contextWindow: 128000,
  },
  "o1-mini-2024-09-12": {
    contextWindow: 128000,
  },
  o1: {
    contextWindow: 128000,
  },
  "o1-2024-12-17": {
    contextWindow: 128000,
  },
};

export const O3_MODELS = {
  "o3-mini": {
    contextWindow: 200000,
  },
  "o3-mini-2025-01-31": {
    contextWindow: 200000,
  },
  o3: {
    contextWindow: 200000,
  },
  "o3-2025-04-16": {
    contextWindow: 200000,
  },
};

export const O4_MODELS = {
  "o4-mini": {
    contextWindow: 200000,
  },
  "o4-mini-2025-04-16": {
    contextWindow: 200000,
  },
};

/**
 * We currently support GPT-3.5 and GPT-4 models
 */
export const ALL_AVAILABLE_OPENAI_MODELS = {
  ...GPT4_MODELS,
  ...GPT35_MODELS,
  ...O1_MODELS,
  ...O3_MODELS,
  ...O4_MODELS,
} satisfies Record<ChatModel, { contextWindow: number }>;

export function isFunctionCallingModel(llm: LLM): llm is OpenAI {
  let model: string;
  if (llm instanceof OpenAI) {
    model = llm.model;
  } else if ("model" in llm && typeof llm.model === "string") {
    model = llm.model;
  } else {
    return false;
  }
  const isChatModel = Object.keys(ALL_AVAILABLE_OPENAI_MODELS).includes(model);
  const isOld = model.includes("0314") || model.includes("0301");
  const isO1 = model.startsWith("o1");
  return isChatModel && !isOld && !isO1;
}

export function isReasoningModel(model: ChatModel | string): boolean {
  const isO1 = model.startsWith("o1");
  const isO3 = model.startsWith("o3");
  return isO1 || isO3;
}

export function isTemperatureSupported(model: ChatModel | string): boolean {
  return !model.startsWith("o3");
}

export type OpenAIAdditionalMetadata = object;

export type OpenAIAdditionalChatOptions = Omit<
  Partial<OpenAILLM.Chat.ChatCompletionCreateParams>,
  | "max_tokens"
  | "messages"
  | "model"
  | "temperature"
  | "reasoning_effort"
  | "top_p"
  | "stream"
  | "tools"
  | "toolChoice"
>;

export type LLMInstance = Pick<
  AzureOpenAILLM | OpenAILLM,
  "chat" | "apiKey" | "baseURL" | "responses"
>;

export type OpenAIResponsesChatOptions = Omit<
  Partial<OpenAILLM.Responses.ResponseCreateParams>,
  | "model"
  | "input"
  | "stream"
  | "tools"
  | "toolChoice"
  | "temperature"
  | "reasoning_effort"
  | "top_p"
  | "max_output_tokens"
  | "include"
>;

export type ResponsesAdditionalOptions = {
  built_in_tool_calls: Array<
    | OpenAILLM.Responses.ResponseFileSearchToolCall
    | OpenAILLM.Responses.ResponseComputerToolCall
    | OpenAILLM.Responses.ResponseFunctionWebSearch
    | OpenAILLM.Responses.ResponseFileSearchCallCompletedEvent
    | OpenAILLM.Responses.ResponseWebSearchCallCompletedEvent
  >;
  annotations?: Array<
    | OpenAILLM.Responses.ResponseOutputText.FileCitation
    | OpenAILLM.Responses.ResponseOutputText.URLCitation
    | OpenAILLM.Responses.ResponseOutputText.FilePath
  >;
  refusal?: string;
  reasoning?: OpenAILLM.Responses.ResponseReasoningItem;
  usage?: OpenAILLM.Responses.ResponseUsage;
};

export type StreamState = {
  delta: string;
  currentToolCall: PartialToolCall | null;
  shouldEmitToolCall: PartialToolCall | null;
  options: ResponsesAdditionalOptions;
  previousResponseId: string | null;
};

export type ResponsesMessageContentTextDetail = {
  type: "input_text";
  text: string;
};

export type ResponsesMessageContentImageDetail = {
  type: "input_image";
  image_url: string;
  detail: "high" | "low" | "auto";
};
export type ResponsesMessageContentDetail =
  | ResponsesMessageContentTextDetail
  | ResponsesMessageContentImageDetail;

export type ResponseMessageContent = string | ResponsesMessageContentDetail[];

export type OpenAIResponsesRole = "user" | "assistant" | "system" | "developer";
