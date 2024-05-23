import {
  GoogleGenerativeAI,
  GenerativeModel as GoogleGenerativeModel,
  type EnhancedGenerateContentResponse,
  type ModelParams as GoogleModelParams,
  type GenerateContentStreamResult as GoogleStreamGenerateContentResult,
} from "@google/generative-ai";

import { getEnv } from "@llamaindex/env";
import { ToolCallLLM } from "../base.js";
import type {
  CompletionResponse,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
} from "../types.js";
import { streamConverter, wrapLLMEvent } from "../utils.js";
import {
  GEMINI_BACKENDS,
  GEMINI_MODEL,
  type GeminiAdditionalChatOptions,
  type GeminiChatNonStreamResponse,
  type GeminiChatParamsNonStreaming,
  type GeminiChatParamsStreaming,
  type GeminiChatStreamResponse,
  type GeminiMessageRole,
  type GeminiModelInfo,
  type GeminiSessionOptions,
  type GoogleGeminiSessionOptions,
  type IGeminiSession,
} from "./types.js";
import { GeminiHelper, getChatContext, getPartsText } from "./utils.js";

export const GEMINI_MODEL_INFO_MAP: Record<GEMINI_MODEL, GeminiModelInfo> = {
  [GEMINI_MODEL.GEMINI_PRO]: { contextWindow: 30720 },
  [GEMINI_MODEL.GEMINI_PRO_VISION]: { contextWindow: 12288 },
  [GEMINI_MODEL.GEMINI_PRO_LATEST]: { contextWindow: 10 ** 6 },
  // multi-modal/multi turn
  [GEMINI_MODEL.GEMINI_PRO_1_5_PRO_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_PREVIEW]: { contextWindow: 10 ** 6 },
};

const SUPPORT_TOOL_CALL_MODELS: GEMINI_MODEL[] = [
  GEMINI_MODEL.GEMINI_PRO,
  GEMINI_MODEL.GEMINI_PRO_VISION,
  GEMINI_MODEL.GEMINI_PRO_1_5_PRO_PREVIEW,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_PREVIEW,
];

const DEFAULT_GEMINI_PARAMS = {
  model: GEMINI_MODEL.GEMINI_PRO,
  temperature: 0.1,
  topP: 1,
  maxTokens: undefined,
};

export type GeminiConfig = Partial<typeof DEFAULT_GEMINI_PARAMS> & {
  session?: IGeminiSession;
};

/**
 * Gemini Session to manage the connection to the Gemini API
 */
export class GeminiSession implements IGeminiSession {
  private gemini: GoogleGenerativeAI;

  constructor(options: GoogleGeminiSessionOptions) {
    if (!options.apiKey) {
      options.apiKey = getEnv("GOOGLE_API_KEY");
    }
    if (!options.apiKey) {
      throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
    }
    this.gemini = new GoogleGenerativeAI(options.apiKey);
  }

  getGenerativeModel(metadata: GoogleModelParams): GoogleGenerativeModel {
    return this.gemini.getGenerativeModel(metadata);
  }

  getResponseText(response: EnhancedGenerateContentResponse): string {
    return response.text();
  }

  async *getChatStream(
    result: GoogleStreamGenerateContentResult,
  ): GeminiChatStreamResponse {
    yield* streamConverter(result.stream, (response) => ({
      delta: this.getResponseText(response),
      raw: response,
    }));
  }

  getCompletionStream(
    result: GoogleStreamGenerateContentResult,
  ): AsyncIterable<CompletionResponse> {
    return streamConverter(result.stream, (response) => ({
      text: this.getResponseText(response),
      raw: response,
    }));
  }
}

/**
 * Gemini Session Store to manage the current Gemini sessions
 */
export class GeminiSessionStore {
  static sessions: Array<{
    session: IGeminiSession;
    options: GeminiSessionOptions;
  }> = [];

  private static getSessionId(options: GeminiSessionOptions): string {
    if (options.backend === GEMINI_BACKENDS.GOOGLE)
      return options?.apiKey ?? "";
    return "";
  }
  private static sessionMatched(
    o1: GeminiSessionOptions,
    o2: GeminiSessionOptions,
  ): boolean {
    return (
      GeminiSessionStore.getSessionId(o1) ===
      GeminiSessionStore.getSessionId(o2)
    );
  }

  static get(
    options: GeminiSessionOptions = { backend: GEMINI_BACKENDS.GOOGLE },
  ): IGeminiSession {
    let session = this.sessions.find((session) =>
      this.sessionMatched(session.options, options),
    )?.session;
    if (session) return session;

    if (options.backend === GEMINI_BACKENDS.VERTEX) {
      throw Error("No Session");
    } else {
      session = new GeminiSession(options);
    }
    this.sessions.push({ session, options });
    return session;
  }
}

/**
 * ToolCallLLM for Gemini
 */
export class Gemini extends ToolCallLLM<GeminiAdditionalChatOptions> {
  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number;
  session: IGeminiSession;

  constructor(init?: GeminiConfig) {
    super();
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_PRO;
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.session = init?.session ?? GeminiSessionStore.get();
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
      contextWindow: GEMINI_MODEL_INFO_MAP[this.model].contextWindow,
      tokenizer: undefined,
    };
  }

  protected async nonStreamChat(
    params: GeminiChatParamsNonStreaming,
  ): Promise<GeminiChatNonStreamResponse> {
    const context = getChatContext(params);
    const client = this.session.getGenerativeModel(this.metadata);
    const chat = client.startChat({
      history: context.history,
    });
    const { response } = await chat.sendMessage(context.message);
    const topCandidate = response.candidates![0];

    return {
      raw: response,
      message: {
        content: this.session.getResponseText(response),
        role: GeminiHelper.ROLES_FROM_GEMINI[
          topCandidate.content.role as GeminiMessageRole
        ],
      },
    };
  }

  protected async *streamChat(
    params: GeminiChatParamsStreaming,
  ): GeminiChatStreamResponse {
    const context = getChatContext(params);
    const client = this.session.getGenerativeModel(this.metadata);
    const chat = client.startChat({
      history: context.history,
    });
    const result = await chat.sendMessageStream(context.message);
    yield* this.session.getChatStream(result);
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
    const { prompt, stream } = params;
    const client = this.session.getGenerativeModel(this.metadata);

    if (stream) {
      const result = await client.generateContentStream(
        getPartsText(GeminiHelper.messageContentToGeminiParts(prompt)),
      );
      return this.session.getCompletionStream(result);
    }

    const result = await client.generateContent(
      getPartsText(GeminiHelper.messageContentToGeminiParts(prompt)),
    );
    return {
      text: this.session.getResponseText(result.response),
      raw: result.response,
    };
  }
}
