import {
  GoogleGenerativeAI,
  type Content as GeminiMessageContent,
} from "@google/generative-ai";
import { getEnv } from "@llamaindex/env";
import { ToolCallLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  MessageType,
  ToolCallLLMMessageOptions,
} from "./types.js";
import { wrapLLMEvent } from "./utils.js";

export type GeminiSessionOptions = {
  apiKey?: string;
};

export class GeminiSession {
  gemini: GoogleGenerativeAI;

  constructor(options: GeminiSessionOptions) {
    if (!options.apiKey) {
      options.apiKey = getEnv("ANTHROPIC_API_KEY");
    }
    if (!options.apiKey) {
      throw new Error("Set Anthropic Key in ANTHROPIC_API_KEY env variable");
    }
    this.gemini = new GoogleGenerativeAI(options.apiKey);
  }
}

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

// Gemini only has user and model roles. Put the rest in user role.
type GeminiMessageRole = "user" | "model";

export class GeminiHelper {
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
    throw new Error("Not implemented");
  }

  public static chatMessageToGemini(
    message: ChatMessage,
  ): GeminiMessageContent {
    throw new Error("Not implemented");
  }
}

export enum GEMINI_MODEL {
  GEMINI_PRO = "gemini-pro",
  GEMINI_PRO_VISION = "gemini-pro-vision",
  EMBEDDING_001 = "embedding-001",
  AQA = "aqa",
}

export const SUPPORT_TOOL_CALL_MODELS: GEMINI_MODEL[] = [
  GEMINI_MODEL.GEMINI_PRO,
  GEMINI_MODEL.GEMINI_PRO_VISION,
  GEMINI_MODEL.EMBEDDING_001,
  GEMINI_MODEL.AQA,
];

export interface GeminiModelInfo {
  contextWindow: number;
}

export const GEMINI_MODEL_INFO_MAP: Record<GEMINI_MODEL, GeminiModelInfo> = {
  [GEMINI_MODEL.GEMINI_PRO]: { contextWindow: 30720 },
  [GEMINI_MODEL.GEMINI_PRO_VISION]: { contextWindow: 12288 },
  [GEMINI_MODEL.EMBEDDING_001]: { contextWindow: 2048 },
  [GEMINI_MODEL.AQA]: { contextWindow: 7168 },
};

export const DEFAULT_GEMINI_PARAMS = {
  model: GEMINI_MODEL.GEMINI_PRO,
  temperature: 0.1,
  topP: 1,
  maxTokens: undefined,
};

export type GeminiLLMConfig = Partial<typeof DEFAULT_GEMINI_PARAMS> & {
  session?: GeminiSession;
};

export type GeminiAdditionalChatOptions = {};

export type GeminiChatParamsStreaming = LLMChatParamsStreaming<
  GeminiAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type GeminiChatParamsNonStreaming = LLMChatParamsNonStreaming<
  GeminiAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

/**
 * ToolCallLLM for Gemini
 * Missing features: image upload, use tools
 */
export class Gemini extends ToolCallLLM<GeminiAdditionalChatOptions> {
  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number;
  session: GeminiSession;

  constructor(init?: GeminiLLMConfig) {
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

  private getSystemPrompt(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): string | undefined {
    const systemMessages = messages.filter(
      (message) => message.role === "system",
    );
    if (systemMessages.length === 0) return undefined;
    return systemMessages.map((message) => message.content).join("\n");
  }

  chat(
    params: GeminiChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>>;
  chat(
    params: GeminiChatParamsNonStreaming,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;
  @wrapLLMEvent
  async chat(
    params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
  ): Promise<
    | AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>
    | ChatResponse<ToolCallLLMMessageOptions>
  > {
    const { messages, stream, tools } = params;
    const messagePrompt = this.getSystemPrompt(messages);
    const mergedMessages =
      GeminiHelper.mergeNeighboringSameRoleMessages(messages);
    const history = mergedMessages.slice(0, -1);
    const nextMessage = mergedMessages[mergedMessages.length - 1];

    // Non-streaming chat
    const client = this.session.gemini.getGenerativeModel(this.metadata);
    const chat = client.startChat({
      history: history.map(GeminiHelper.chatMessageToGemini),
    });
    const result = await chat.sendMessage(
      GeminiHelper.chatMessageToGemini(nextMessage).parts,
    );
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

    throw new Error("Not implemented");
  }
}
