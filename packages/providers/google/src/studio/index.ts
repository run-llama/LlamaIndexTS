import {
  GenerateContentResponse,
  GoogleGenAI,
  Modality,
  type Blob,
  type GenerateContentConfig,
  type GoogleGenAIOptions,
} from "@google/genai";
import {
  ToolCallLLM,
  type ChatResponse,
  type ChatResponseChunk,
  type CompletionResponse,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMCompletionParamsNonStreaming,
  type LLMCompletionParamsStreaming,
  type LLMMetadata,
  type ToolCall,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
export { Modality };

import { streamConverter } from "@llamaindex/core/utils";

import { wrapLLMEvent } from "@llamaindex/core/decorator";
import type { JSONObject } from "@llamaindex/core/global";
import { randomUUID } from "@llamaindex/env";
import { DEFAULT_GEMINI_PARAMS, SUPPORT_TOOL_CALL_MODELS } from "../constants";
import { GEMINI_MODEL } from "../types";
import {
  mapChatMessagesToGoogleFunctions,
  mapChatMessagesToGoogleMessages,
  mapMessageContentDetailToGooglePart,
  mapMessageContentToMessageContentDetails,
} from "./utils";

export type GoogleAdditionalChatOptions = { config: GenerateContentConfig };

export type GoogleChatStreamResponse = AsyncIterable<
  ChatResponseChunk<
    ToolCallLLMMessageOptions & {
      data?: Blob[];
    }
  >
>;

export type GoogleChatParamsStreaming = LLMChatParamsStreaming<
  GoogleAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type GoogleChatParamsNonStreaming = LLMChatParamsNonStreaming<
  GoogleAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type GoogleChatNonStreamResponse =
  ChatResponse<ToolCallLLMMessageOptions>;

export const getGoogleStudioInlineData = (
  response: GenerateContentResponse,
): Blob[] => {
  return response.candidates
    ?.flatMap((candidate) => candidate.content?.parts)
    .map((part) => part?.inlineData)
    .filter((data) => data) as Blob[];
};

export type GoogleModelParams = {
  model: GEMINI_MODEL;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

export type GoogleParams = GoogleGenAIOptions & GoogleModelParams;

export class GoogleStudio extends ToolCallLLM<GoogleAdditionalChatOptions> {
  client: GoogleGenAI;
  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  topK?: number;

  constructor({
    temperature,
    topP,
    maxTokens,
    model,
    ...params
  }: GoogleParams) {
    super();
    this.model = model;
    this.maxTokens = maxTokens ?? DEFAULT_GEMINI_PARAMS.maxTokens;
    this.temperature = temperature ?? DEFAULT_GEMINI_PARAMS.temperature;
    this.topP = topP ?? DEFAULT_GEMINI_PARAMS.topP;
    this.client = new GoogleGenAI(params);
  }

  get supportToolCall(): boolean {
    return SUPPORT_TOOL_CALL_MODELS.includes(this.model);
  }

  get metadata(): LLMMetadata {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: 128000,
      tokenizer: undefined,
      structuredOutput: false,
    };
  }

  getToolCallsFromResponse(response: GenerateContentResponse): ToolCall[] {
    if (!response.functionCalls) return [];
    return response.functionCalls.map((call) => ({
      id: call.id ?? randomUUID(),
      name: call.name ?? "",
      input: call.args as JSONObject,
    }));
  }

  protected async nonStreamChat(
    params: GoogleChatParamsNonStreaming,
  ): Promise<GoogleChatNonStreamResponse> {
    if (!this.supportToolCall && params.tools?.length) {
      console.warn(`The model "${this.model}" doesn't support ToolCall`);
    }

    const config: GenerateContentConfig =
      params.additionalChatOptions?.config ?? {};
    if (params.tools?.length) {
      if (config.responseModalities?.includes(Modality.IMAGE)) {
        console.warn("Tools are currently not supported with Modality.IMAGE");
      } else {
        config.tools = mapChatMessagesToGoogleFunctions(params.tools);
      }
    }
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: mapChatMessagesToGoogleMessages(params.messages),
      config,
    });

    if (this.supportToolCall) {
      const tools = this.getToolCallsFromResponse(response);
      if (tools.length) {
        return {
          raw: response,
          message: {
            role: "assistant",
            content: "",
            options: { toolCall: tools },
          },
        };
      }
    }
    return {
      raw: response,
      message: {
        role: "assistant",
        content: response.text ?? "",
        options: {
          inlineData: getGoogleStudioInlineData(response),
        },
      },
    };
  }

  async *reduceStream(
    stream: AsyncGenerator<GenerateContentResponse>,
  ): AsyncIterable<ChatResponseChunk> {
    for await (const response of stream) {
      if (response.functionCalls?.length) {
        const toolCalls = this.getToolCallsFromResponse(response) as ToolCall[];
        yield {
          delta: "",
          raw: response,
          options: { toolCall: toolCalls },
        } as ChatResponseChunk;
      }

      const text = response.candidates
        ?.flatMap((candidate) => candidate.content?.parts)
        .map((part) => part?.text ?? "")
        .filter((text) => text)
        .join("");
      if (!text) continue;
      yield {
        delta: text,
        raw: response,
        options: {
          inlineData: getGoogleStudioInlineData(response),
        },
      } as ChatResponseChunk;
    }
  }

  protected async *streamChat(
    params: GoogleChatParamsStreaming,
  ): GoogleChatStreamResponse {
    if (!this.supportToolCall && params.tools?.length) {
      console.warn(`The model "${this.model}" doesn't support ToolCall`);
    }
    const config: GenerateContentConfig =
      params.additionalChatOptions?.config ?? {};
    if (params.tools?.length) {
      if (config.responseModalities?.includes(Modality.IMAGE)) {
        console.warn("Tools are currently not supported with Modality.IMAGE");
      } else {
        config.tools = mapChatMessagesToGoogleFunctions(params.tools);
      }
    }
    const response = await this.client.models.generateContentStream({
      model: this.model,
      contents: mapChatMessagesToGoogleMessages(params.messages),
      config,
    });
    yield* this.reduceStream(response);
  }

  chat(params: GoogleChatParamsStreaming): Promise<GoogleChatStreamResponse>;
  chat(
    params: GoogleChatParamsNonStreaming,
  ): Promise<GoogleChatNonStreamResponse>;
  @wrapLLMEvent
  async chat(
    params: GoogleChatParamsStreaming | GoogleChatParamsNonStreaming,
  ): Promise<GoogleChatStreamResponse | GoogleChatNonStreamResponse> {
    if (params.stream) {
      return this.streamChat(params);
    }
    return this.nonStreamChat(params);
  }

  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(
    params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse | AsyncIterable<CompletionResponse>> {
    const contents = mapMessageContentToMessageContentDetails(
      params.prompt,
    ).map(mapMessageContentDetailToGooglePart);
    if (params.stream) {
      const response = await this.client.models.generateContentStream({
        model: this.model,
        contents,
      });
      return streamConverter(response, (response) => {
        return {
          text: response.text ?? "",
          raw: response,
        };
      });
    }
    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
    });

    return {
      text: response.text || "",
      raw: response,
    };
  }
}
