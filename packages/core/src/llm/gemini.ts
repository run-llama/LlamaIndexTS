import {
  ChatSession,
  GoogleGenerativeAI,
  type Content as GeminiMessageContent,
  type Part,
} from "@google/generative-ai";
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

// Session and Model Type Definitions
type GeminiSessionOptions = {
  apiKey?: string;
};

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
  session?: GeminiSession;
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

/**
 * Gemini Session to manage the connection to the Gemini API
 */
export class GeminiSession {
  gemini: GoogleGenerativeAI;

  constructor(options: GeminiSessionOptions) {
    if (!options.apiKey) {
      options.apiKey = getEnv("GOOGLE_API_KEY");
    }
    if (!options.apiKey) {
      throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
    }
    this.gemini = new GoogleGenerativeAI(options.apiKey);
  }
}

/**
 * Gemini Session Store to manage the current Gemini sessions
 */
export class GeminiSessionStore {
  static sessions: Array<{
    session: GeminiSession;
    options: GeminiSessionOptions;
  }> = [];

  private static sessionMatched(
    o1: GeminiSessionOptions,
    o2: GeminiSessionOptions,
  ): boolean {
    return o1.apiKey === o2.apiKey;
  }

  static get(options: GeminiSessionOptions = {}): GeminiSession {
    let session = this.sessions.find((session) =>
      this.sessionMatched(session.options, options),
    )?.session;
    if (!session) {
      session = new GeminiSession(options);
      this.sessions.push({ session, options });
    }
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
  session: GeminiSession;

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

  private prepareChat(
    params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
  ): {
    chat: ChatSession;
    messageContent: Part[];
  } {
    const messages = GeminiHelper.mergeNeighboringSameRoleMessages(
      params.messages.map(GeminiHelper.chatMessageToGemini),
    );

    const history = messages.slice(0, -1);

    const client = this.session.gemini.getGenerativeModel(this.metadata);

    const chat = client.startChat({
      history,
    });
    return {
      chat,
      messageContent: messages[messages.length - 1].parts,
    };
  }

  protected async nonStreamChat(
    params: GeminiChatParamsNonStreaming,
  ): Promise<GeminiChatNonStreamResponse> {
    const { chat, messageContent } = this.prepareChat(params);
    const result = await chat.sendMessage(messageContent);
    const { response } = result;
    const topCandidate = response.candidates![0];
    return {
      raw: response,
      message: {
        content: response.text(),
        role: GeminiHelper.ROLES_FROM_GEMINI[
          topCandidate.content.role as GeminiMessageRole
        ],
      },
    };
  }

  protected async *streamChat(
    params: GeminiChatParamsStreaming,
  ): GeminiChatStreamResponse {
    const { chat, messageContent } = this.prepareChat(params);
    const result = await chat.sendMessageStream(messageContent);
    yield* streamConverter(result.stream, (response) => ({
      delta: response.text(),
      raw: response,
    }));
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
    const client = this.session.gemini.getGenerativeModel(this.metadata);

    if (stream) {
      const result = await client.generateContentStream(
        GeminiHelper.messageContentToGeminiParts(prompt),
      );
      return streamConverter(result.stream, (response) => {
        return {
          text: response.text(),
          raw: response,
        };
      });
    }

    const result = await client.generateContent(
      GeminiHelper.messageContentToGeminiParts(prompt),
    );
    return {
      text: result.response.text(),
      raw: result.response,
    };
  }
}
