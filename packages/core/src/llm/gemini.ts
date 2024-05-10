import {
  GoogleGenerativeAI,
  GenerativeModel as GoogleGenerativeModel,
  type EnhancedGenerateContentResponse,
  type Content as GeminiMessageContent,
  type GenerateContentStreamResult as GoogleStreamGenerateContentResult,
  type Part as GooglePart,
  type ModelParams as GoogleModelParams,
} from "@google/generative-ai";

import {
  VertexAI,
  GenerativeModel as VertexGenerativeModel,
  GenerativeModelPreview as VertexGenerativeModelPreview,
  type StreamGenerateContentResult as VertexStreamGenerateContentResult,
  type GenerateContentResponse,
  type VertexInit,
  type Part as VertexPart,
  type ModelParams as VertexModelParams,
} from "@google-cloud/vertexai";

import { getEnv } from "@llamaindex/env";
import { ToolCallLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
  MessageContent,
  MessageContentImageDetail,
  MessageContentTextDetail,
  MessageType,
  ToolCallLLMMessageOptions,
} from "./types.js";
import { streamConverter, wrapLLMEvent } from "./utils.js";

export enum GEMINI_BACKENDS {
  GOOGLE = "google",
  VERTEX = "vertex",
}

type GoogleGeminiSessionOptions = {
  apiKey?: string;
};

type VertexGeminiSessionOptions = {
  preview?: boolean;
} & VertexInit;

type GeminiSessionOptions =
  | (GoogleGeminiSessionOptions & { backend: GEMINI_BACKENDS.GOOGLE })
  | (VertexGeminiSessionOptions & { backend: GEMINI_BACKENDS.VERTEX });

export enum GEMINI_MODEL {
  GEMINI_PRO = "gemini-pro",
  GEMINI_PRO_VISION = "gemini-pro-vision",
  GEMINI_PRO_LATEST = "gemini-1.5-pro-latest",
}

export interface GeminiModelInfo {
  contextWindow: number;
}

export const GEMINI_MODEL_INFO_MAP: Record<GEMINI_MODEL, GeminiModelInfo> = {
  [GEMINI_MODEL.GEMINI_PRO]: { contextWindow: 30720 },
  [GEMINI_MODEL.GEMINI_PRO_VISION]: { contextWindow: 12288 },
  [GEMINI_MODEL.GEMINI_PRO_LATEST]: { contextWindow: 10 ** 6 },
};

const SUPPORT_TOOL_CALL_MODELS: GEMINI_MODEL[] = [
  GEMINI_MODEL.GEMINI_PRO,
  GEMINI_MODEL.GEMINI_PRO_VISION,
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

/// Chat Type Definitions
type GeminiMessageRole = "user" | "model";

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

type Part = GooglePart | VertexPart;
type ModelParams = GoogleModelParams | VertexModelParams;

type GenerativeModel =
  | VertexGenerativeModelPreview
  | VertexGenerativeModel
  | GoogleGenerativeModel;

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

type ChatContext = { message: Part[]; history: GeminiMessageContent[] };

const getPartsText = (parts: Part[]): string => {
  const textStrings = [];
  if (parts.length) {
    for (const part of parts) {
      if (part.text) {
        textStrings.push(part.text);
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join("");
  } else {
    return "";
  }
};

/**
 * Returns all text found in all parts of first candidate.
 */
const getText = (response: GenerateContentResponse): string => {
  if (response.candidates?.[0].content?.parts) {
    return getPartsText(response.candidates?.[0].content?.parts);
  }
  return "";
};

const cleanParts = (message: GeminiMessageContent): GeminiMessageContent => {
  return {
    ...message,
    parts: message.parts.filter((part) => part.text?.trim()),
  };
};

const getChatContext = (
  params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
): ChatContext => {
  // Gemini doesn't allow:
  // 1. Consecutive messages from the same role
  // 2. Parts that have empty text
  const messages = GeminiHelper.mergeNeighboringSameRoleMessages(
    params.messages.map(GeminiHelper.chatMessageToGemini),
  ).map(cleanParts);

  const history = messages.slice(0, -1);
  const message = messages[messages.length - 1].parts;
  return {
    history,
    message,
  };
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

/* To use Google's Vertex AI backend, it doesn't use api key authentication.
 *
 * To authenticate for local development:
 *
 *     ```
 *     npm install @google-cloud/vertexai
 *     gcloud auth application-default login
 *     ```
 * For production the prefered method is via a service account, more
 * details: https://cloud.google.com/docs/authentication/
 *
 * */

export class GeminiVertexSession implements IGeminiSession {
  private vertex: VertexAI;
  private preview: boolean = false;

  constructor(options?: Partial<VertexGeminiSessionOptions>) {
    const project = options?.project ?? getEnv("GOOGLE_VERTEX_PROJECT");
    const location = options?.location ?? getEnv("GOOGLE_VERTEX_LOCATION");
    if (!project || !location) {
      throw new Error(
        "Set Google Vertex project and location in GOOGLE_VERTEX_PROJECT and GOOGLE_VERTEX_LOCATION env variables",
      );
    }
    this.vertex = new VertexAI({
      ...options,
      project,
      location,
    });
    this.preview = options?.preview ?? false;
  }

  getGenerativeModel(
    metadata: VertexModelParams,
  ): VertexGenerativeModelPreview | VertexGenerativeModel {
    if (this.preview) return this.vertex.preview.getGenerativeModel(metadata);
    return this.vertex.getGenerativeModel(metadata);
  }

  getResponseText(response: GenerateContentResponse): string {
    return getText(response);
  }

  async *getChatStream(
    result: VertexStreamGenerateContentResult,
  ): GeminiChatStreamResponse {
    yield* streamConverter(result.stream, (response) => ({
      delta: this.getResponseText(response),
      raw: response,
    }));
  }
  getCompletionStream(
    result: VertexStreamGenerateContentResult,
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
    if (options.backend === GEMINI_BACKENDS.VERTEX)
      return `${options.location}/${options.project}`;

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
      session = new GeminiVertexSession(options);
    } else {
      session = new GeminiSession(options);
    }
    this.sessions.push({ session, options });
    return session;
  }
}

/**
 * Helper class providing utility functions for Gemini
 */
class GeminiHelper {
  // Gemini only has user and model roles. Put the rest in user role.
  public static readonly ROLES_TO_GEMINI: Record<
    MessageType,
    GeminiMessageRole
  > = {
    user: "user",
    system: "user",
    assistant: "model",
    memory: "user",
  };

  public static readonly ROLES_FROM_GEMINI: Record<
    GeminiMessageRole,
    MessageType
  > = {
    user: "user",
    model: "assistant",
  };

  public static mergeNeighboringSameRoleMessages(
    messages: GeminiMessageContent[],
  ): GeminiMessageContent[] {
    return messages.reduce(
      (
        result: GeminiMessageContent[],
        current: GeminiMessageContent,
        index: number,
      ) => {
        if (index > 0 && messages[index - 1].role === current.role) {
          result[result.length - 1].parts = [
            ...result[result.length - 1].parts,
            ...current.parts,
          ];
        } else {
          result.push(current);
        }
        return result;
      },
      [],
    );
  }

  public static messageContentToGeminiParts(content: MessageContent): Part[] {
    if (typeof content === "string") {
      return [{ text: content }];
    }

    const parts: Part[] = [];
    const imageContents = content.filter(
      (i) => i.type === "image_url",
    ) as MessageContentImageDetail[];
    parts.push(
      ...imageContents.map((i) => ({
        fileData: {
          mimeType: i.type,
          fileUri: i.image_url.url,
        },
      })),
    );
    const textContents = content.filter(
      (i) => i.type === "text",
    ) as MessageContentTextDetail[];
    parts.push(...textContents.map((t) => ({ text: t.text })));
    return parts;
  }

  public static chatMessageToGemini(
    message: ChatMessage,
  ): GeminiMessageContent {
    return {
      role: GeminiHelper.ROLES_TO_GEMINI[message.role],
      parts: GeminiHelper.messageContentToGeminiParts(message.content),
    };
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
