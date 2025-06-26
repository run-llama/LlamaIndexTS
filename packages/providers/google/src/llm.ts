import {
  GoogleGenAI,
  type FunctionCall,
  type GenerateContentConfig,
  type GoogleGenAIOptions,
  type SafetySetting,
} from "@google/genai";
import { wrapLLMEvent } from "@llamaindex/core/decorator";
import type { JSONObject } from "@llamaindex/core/global";
import type {
  CompletionResponse,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
  MessageType,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { ToolCallLLM } from "@llamaindex/core/llms";
import { streamConverter } from "@llamaindex/core/utils";
import { getEnv, randomUUID } from "@llamaindex/env";
import {
  DEFAULT_GEMINI_PARAMS,
  DEFAULT_SAFETY_SETTINGS,
  GEMINI_MODEL_INFO_MAP,
  ROLES_FROM_GEMINI,
  SUPPORT_TOOL_CALL_MODELS,
} from "./constants.js";
import { GeminiLive } from "./live.js";
import {
  GEMINI_MODEL,
  type GeminiAdditionalChatOptions,
  type GeminiChatNonStreamResponse,
  type GeminiChatParamsNonStreaming,
  type GeminiChatParamsStreaming,
  type GeminiChatStreamResponse,
  type GeminiMessageRole,
  type GeminiVoiceName,
} from "./types.js";
import { getChatContext, messageContentToGeminiParts } from "./utils.js";

export type GeminiConfig = Partial<typeof DEFAULT_GEMINI_PARAMS> & {
  safetySettings?: SafetySetting[];
  voiceName?: GeminiVoiceName;
} & GoogleGenAIOptions;

/**
 * ToolCallLLM for Gemini
 */
export class Gemini extends ToolCallLLM<GeminiAdditionalChatOptions> {
  private _live: GeminiLive | undefined;
  private ai: GoogleGenAI;

  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  safetySettings: SafetySetting[];
  voiceName?: GeminiVoiceName | undefined;
  apiKey?: string | undefined;

  constructor(init?: GeminiConfig) {
    super();
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_PRO;
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.safetySettings = init?.safetySettings ?? DEFAULT_SAFETY_SETTINGS;
    this.voiceName = init?.voiceName ?? undefined;
    this.apiKey = init?.apiKey ?? getEnv("GOOGLE_API_KEY");

    if (!this.apiKey) {
      throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
    }

    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  get supportToolCall(): boolean {
    return SUPPORT_TOOL_CALL_MODELS.includes(this.model);
  }

  // TODO: also update live api to use https://ai.google.dev/gemini-api/docs/ephemeral-tokens
  get live(): GeminiLive {
    if (!this._live) {
      this._live = new GeminiLive({
        apiKey: this.apiKey,
        voiceName: this.voiceName,
        model: this.model,
      });
    }
    return this._live;
  }

  get metadata(): LLMMetadata & { safetySettings: SafetySetting[] } {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: GEMINI_MODEL_INFO_MAP[this.model].contextWindow,
      tokenizer: undefined,
      structuredOutput: false,
      safetySettings: this.safetySettings,
    };
  }

  get generateContentConfig(): GenerateContentConfig {
    return {
      temperature: this.temperature,
      topP: this.topP,
      safetySettings: this.safetySettings,
      ...(this.maxTokens ? { maxOutputTokens: this.maxTokens } : {}),
      // TODO: check weather support other config such as contextWindow
    };
  }

  chat(params: GeminiChatParamsStreaming): Promise<GeminiChatStreamResponse>;
  chat(
    params: GeminiChatParamsNonStreaming,
  ): Promise<GeminiChatNonStreamResponse>;
  @wrapLLMEvent
  async chat(
    params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
  ): Promise<GeminiChatStreamResponse | GeminiChatNonStreamResponse> {
    if (params.stream) return this.streamChat(params);
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
    if (params.stream) return this.streamGenerate(params);
    return this.nonStreamGenerate(params);
  }

  private async nonStreamChat(
    params: GeminiChatParamsNonStreaming,
  ): Promise<GeminiChatNonStreamResponse> {
    const { message, history } = await getChatContext(params.messages);

    const chat = this.ai.chats.create({
      model: this.model,
      config: this.generateContentConfig,
      history,
    });

    const response = await chat.sendMessage({ message });

    const geminiRole = response.candidates?.[0]?.content?.role ?? "model";

    return {
      message: {
        content: response.text ?? "",
        role: this.toMessageRole(geminiRole),
        options: this.toMessageOptions(response.functionCalls ?? []),
      },
      raw: response,
    };
  }

  private async streamChat(
    params: GeminiChatParamsStreaming,
  ): Promise<GeminiChatStreamResponse> {
    const { message, history } = await getChatContext(params.messages);

    const chat = this.ai.chats.create({
      model: this.model,
      config: this.generateContentConfig,
      history,
    });

    const generator = await chat.sendMessageStream({ message });

    return streamConverter(generator, (response) => {
      return {
        delta: response.text ?? "",
        options: this.toMessageOptions(response.functionCalls ?? []),
        raw: response,
      };
    });
  }

  private async streamGenerate(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>> {
    const { prompt: content } = params;

    const contents = await messageContentToGeminiParts(content);

    const generator = await this.ai.models.generateContentStream({
      model: this.model,
      contents,
      config: this.generateContentConfig,
    });

    return streamConverter(generator, (response) => ({
      text: response.text ?? "",
      raw: response,
    }));
  }

  private async nonStreamGenerate(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse> {
    const { prompt: content } = params;

    const contents = await messageContentToGeminiParts(content);

    const result = await this.ai.models.generateContent({
      model: this.model,
      config: this.generateContentConfig,
      contents,
    });

    return {
      text: result.text ?? "",
      raw: result,
    };
  }

  // TODO: move to utils
  private toMessageToolCall(call: FunctionCall): ToolCall {
    if (!call.name || !call.args) {
      throw new Error(`Function call name and args are required`);
    }

    return {
      id: randomUUID(),
      name: call.name,
      input: call.args as JSONObject,
    };
  }

  // TODO: move to utils
  private toMessageRole(role: GeminiMessageRole | string): MessageType {
    return ROLES_FROM_GEMINI[role as GeminiMessageRole];
  }

  // TODO: move to utils
  private toMessageOptions(
    toolCalls: FunctionCall[],
  ): ToolCallLLMMessageOptions {
    return toolCalls.length
      ? { toolCall: toolCalls.map(this.toMessageToolCall) }
      : {};
  }
}

/**
 * Convenience function to create a new Gemini instance.
 * @param init - Optional initialization parameters for the Gemini instance.
 * @returns A new Gemini instance.
 */
export const gemini = (init?: ConstructorParameters<typeof Gemini>[0]) =>
  new Gemini(init);
