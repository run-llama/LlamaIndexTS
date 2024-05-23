import {
  GenerativeModel as GoogleGenerativeModel,
  type EnhancedGenerateContentResponse,
  type Content as GeminiMessageContent,
  type FileDataPart as GoogleFileDataPart,
  type InlineDataPart as GoogleInlineFileDataPart,
  type ModelParams as GoogleModelParams,
  type Part as GooglePart,
  type GenerateContentStreamResult as GoogleStreamGenerateContentResult,
} from "@google/generative-ai";

import {
  GenerativeModel as VertexGenerativeModel,
  GenerativeModelPreview as VertexGenerativeModelPreview,
  type GenerateContentResponse,
  type FileDataPart as VertexFileDataPart,
  type VertexInit,
  type InlineDataPart as VertexInlineFileDataPart,
  type ModelParams as VertexModelParams,
  type Part as VertexPart,
  type StreamGenerateContentResult as VertexStreamGenerateContentResult,
} from "@google-cloud/vertexai";

import type {
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  ToolCallLLMMessageOptions,
} from "../types.js";

export enum GEMINI_BACKENDS {
  GOOGLE = "google",
  VERTEX = "vertex",
}

export type GoogleGeminiSessionOptions = {
  apiKey?: string;
};

export type VertexGeminiSessionOptions = {
  preview?: boolean;
} & VertexInit;

export type GeminiSessionOptions =
  | (GoogleGeminiSessionOptions & { backend: GEMINI_BACKENDS.GOOGLE })
  | (VertexGeminiSessionOptions & { backend: GEMINI_BACKENDS.VERTEX });

export enum GEMINI_MODEL {
  GEMINI_PRO = "gemini-pro",
  GEMINI_PRO_VISION = "gemini-pro-vision",
  GEMINI_PRO_LATEST = "gemini-1.5-pro-latest",
  GEMINI_PRO_1_5_PRO_PREVIEW = "gemini-1.5-pro-preview-0514",
  GEMINI_PRO_1_5_FLASH_PREVIEW = "gemini-1.5-flash-preview-0514",
}

export interface GeminiModelInfo {
  contextWindow: number;
}

export type Part = GooglePart | VertexPart;
export type FileDataPart = GoogleFileDataPart | VertexFileDataPart;
export type InlineDataPart =
  | GoogleInlineFileDataPart
  | VertexInlineFileDataPart;

export type ModelParams = GoogleModelParams | VertexModelParams;

export type GenerativeModel =
  | VertexGenerativeModelPreview
  | VertexGenerativeModel
  | GoogleGenerativeModel;

export type ChatContext = { message: Part[]; history: GeminiMessageContent[] };

export type GeminiMessageRole = "user" | "model";

export type GeminiAdditionalChatOptions = {};

export type GeminiChatParamsStreaming = LLMChatParamsStreaming<
  GeminiAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type GeminiChatStreamResponse = AsyncIterable<
  ChatResponseChunk<ToolCallLLMMessageOptions>
>;

export type GeminiChatParamsNonStreaming = LLMChatParamsNonStreaming<
  GeminiAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type GeminiChatNonStreamResponse =
  ChatResponse<ToolCallLLMMessageOptions>;

export interface IGeminiSession {
  getGenerativeModel(metadata: ModelParams): GenerativeModel;
  getResponseText(
    response: EnhancedGenerateContentResponse | GenerateContentResponse,
  ): string;
  getCompletionStream(
    result:
      | GoogleStreamGenerateContentResult
      | VertexStreamGenerateContentResult,
  ): AsyncIterable<CompletionResponse>;
  getChatStream(
    result:
      | GoogleStreamGenerateContentResult
      | VertexStreamGenerateContentResult,
  ): GeminiChatStreamResponse;
}
