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
  EMBEDDING_001 = "embedding-001",
  AQA = "aqa",
  GEMINI_PRO_LATEST = "gemini-1.5-pro-latest",
}

export interface GeminiModelInfo {
  contextWindow: number;
}

export const GEMINI_MODEL_INFO_MAP: Record<GEMINI_MODEL, GeminiModelInfo> = {
  [GEMINI_MODEL.GEMINI_PRO]: { contextWindow: 30720 },
  [GEMINI_MODEL.GEMINI_PRO_VISION]: { contextWindow: 12288 },
  [GEMINI_MODEL.EMBEDDING_001]: { contextWindow: 2048 },
  [GEMINI_MODEL.AQA]: { contextWindow: 7168 },
  [GEMINI_MODEL.GEMINI_PRO_LATEST]: { contextWindow: 10 ** 6 },
};

const SUPPORT_TOOL_CALL_MODELS: GEMINI_MODEL[] = [
  GEMINI_MODEL.GEMINI_PRO,
  GEMINI_MODEL.GEMINI_PRO_VISION,
  GEMINI_MODEL.EMBEDDING_001,
  GEMINI_MODEL.AQA,
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
export class GeminiHelper {
  // Gemini only has user and model roles. Put the rest in user role.
  public static readonly ROLES_TO_GEMINI: Record<
    MessageType,
    GeminiMessageRole
  > = {
    user: "user",
    system: "user",
    assistant: "user",
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
    messages: ChatMessage[],
  ): ChatMessage[] {
    // Gemini does not support multiple messages of the same role in a row, so we merge them
    const mergedMessages: ChatMessage[] = [];
    let i: number = 0;

    while (i < messages.length) {
      const currentMessage: ChatMessage = messages[i];
      // Initialize merged content with current message content
      const mergedContent: MessageContent[] = [currentMessage.content];

      // Check if the next message exists and has the same role
      while (
        i + 1 < messages.length &&
        this.ROLES_TO_GEMINI[messages[i + 1].role] ===
          this.ROLES_TO_GEMINI[currentMessage.role]
      ) {
        i++;
        const nextMessage: ChatMessage = messages[i];
        mergedContent.push(nextMessage.content);
      }

      // Create a new ChatMessage object with merged content
      const mergedMessage: ChatMessage = {
        role: currentMessage.role,
        content: mergedContent.join("\n"),
      };
      mergedMessages.push(mergedMessage);
      i++;
    }

    return mergedMessages;
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
      role: this.ROLES_TO_GEMINI[message.role],
      parts: this.messageContentToGeminiParts(message.content),
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
    const { messages } = params;
    const mergedMessages =
      GeminiHelper.mergeNeighboringSameRoleMessages(messages);
    const history = mergedMessages.slice(0, -1);
    const nextMessage = mergedMessages[mergedMessages.length - 1];
    const messageContent = GeminiHelper.chatMessageToGemini(nextMessage).parts;

    const client = this.session.gemini.getGenerativeModel(this.metadata);

    const chat = client.startChat({
      history: history.map(GeminiHelper.chatMessageToGemini),
    });

    return {
      chat,
      messageContent,
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
    return streamConverter(result.stream, (response) => {
      return {
        text: response.text(),
        raw: response,
      };
    });
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
