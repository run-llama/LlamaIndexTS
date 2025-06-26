import {
  GoogleGenAI,
  type FunctionCall,
  type Content as GeminiMessage,
  type GenerateContentConfig,
  type GoogleGenAIOptions,
  type Part,
  type SafetySetting,
} from "@google/genai";
import { wrapLLMEvent } from "@llamaindex/core/decorator";
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
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { ToolCallLLM } from "@llamaindex/core/llms";
import { streamConverter } from "@llamaindex/core/utils";
import { getEnv, randomUUID } from "@llamaindex/env";
import {
  DEFAULT_SAFETY_SETTINGS,
  GEMINI_MODEL,
  GEMINI_MODEL_INFO_MAP,
  ROLES_FROM_GEMINI,
  ROLES_TO_GEMINI,
  SUPPORT_TOOL_CALL_MODELS,
} from "./constants.js";
import { GeminiLive } from "./live.js";
import { type GeminiMessageRole, type GeminiVoiceName } from "./types.js";
import {
  mergeNeighboringSameRoleMessages,
  messageContentDetailToGeminiPart,
} from "./utils.js";

type GeminiAdditionalChatOptions = object;

type GeminiChatParamsStreaming = LLMChatParamsStreaming<
  GeminiAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

type GeminiChatStreamResponse = AsyncIterable<
  ChatResponseChunk<ToolCallLLMMessageOptions>
>;

type GeminiChatParamsNonStreaming = LLMChatParamsNonStreaming<
  GeminiAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

type GeminiChatNonStreamResponse = ChatResponse<ToolCallLLMMessageOptions>;

type GeminiConfig = {
  model?: GEMINI_MODEL;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
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

    this.ai = new GoogleGenAI({ ...init, apiKey: this.apiKey });
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
    const { message, history } = await this.prepareChatContext(params.messages);

    const chat = this.ai.chats.create({
      model: this.model,
      config: this.generateContentConfig,
      history,
    });

    const response = await chat.sendMessage({ message });

    const geminiRole = response.candidates?.[0]?.content?.role ?? "model";
    const toolCall = response.functionCalls?.map((call) => ({
      id: call.id ?? randomUUID(),
      name: call.name,
      input: call.args,
    }));

    return {
      message: {
        content: response.text ?? "",
        role: ROLES_FROM_GEMINI[geminiRole as GeminiMessageRole],
        options: toolCall?.length ? { toolCall } : undefined,
      },
      raw: response,
    };
  }

  private async streamChat(
    params: GeminiChatParamsStreaming,
  ): Promise<GeminiChatStreamResponse> {
    const { message, history } = await this.prepareChatContext(params.messages);

    const chat = this.ai.chats.create({
      model: this.model,
      config: this.generateContentConfig,
      history,
    });

    const generator = await chat.sendMessageStream({ message });

    return streamConverter(generator, (response) => {
      const toolCall = response.functionCalls?.map((call) => ({
        id: call.id ?? randomUUID(),
        name: call.name,
        input: call.args,
      }));
      return {
        delta: response.text ?? "",
        options: toolCall?.length ? { toolCall } : undefined,
        raw: response,
      };
    });
  }

  private async streamGenerate(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>> {
    const { prompt: content } = params;

    const contents = await this.messageContentToGeminiParts(content);

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

    const contents = await this.messageContentToGeminiParts(content);

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

  /**
   * Prepare chat history and last message for chatting
   * @param messages - array of LlamaIndex ChatMessage
   * @returns chat history and last message
   */
  private async prepareChatContext(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): Promise<{
    message: Part[]; // content of the last message to send
    history: GeminiMessage[]; // history (not including the last message)
  }> {
    const geminiMessages = await Promise.all(
      messages.map(this.toGeminiMessage),
    );
    const mergedMessages = mergeNeighboringSameRoleMessages(geminiMessages);

    return {
      history: mergedMessages.slice(0, -1),
      message: mergedMessages[mergedMessages.length - 1]?.parts || [],
    };
  }

  private async toGeminiMessage(
    message: ChatMessage<ToolCallLLMMessageOptions>,
  ): Promise<GeminiMessage> {
    const { role, options, content } = message;

    let geminiRole = ROLES_TO_GEMINI[role];

    if (options && "toolResult" in options) {
      geminiRole = "function"; // use function role if having toolResult in options
    }

    const parts = await this.messageToGeminiParts(message);

    return { role: geminiRole, parts };
  }

  private async messageToGeminiParts(
    message: ChatMessage<ToolCallLLMMessageOptions>,
  ): Promise<Part[]> {
    const { options, content } = message;

    // if message has toolResult, return a gemini function response part
    if (options && "toolResult" in options) {
      const { id, result } = options.toolResult;
      return [{ functionResponse: { name: id, response: { result } } }];
    }

    // if message has toolCall, return a list of gemini function call parts
    if (options && "toolCall" in options) {
      return options.toolCall.map((call) => ({
        functionCall: { name: call.name, args: call.input } as FunctionCall,
      }));
    }

    // otherwise, extract parts from message content
    return await this.messageContentToGeminiParts(content);
  }

  private async messageContentToGeminiParts(
    content: MessageContent,
  ): Promise<Part[]> {
    // if message content is a string, just return a gemini text part
    if (typeof content === "string") return [{ text: content }];

    // if message content is an array of content details, convert each to a gemini part
    // also upload files if needed
    const uploader = this.ai.files.upload;
    return await Promise.all(
      content.map((item) => messageContentDetailToGeminiPart(item, uploader)),
    );
  }
}

/**
 * Convenience function to create a new Gemini instance.
 * @param init - Optional initialization parameters for the Gemini instance.
 * @returns A new Gemini instance.
 */
export const gemini = (init?: ConstructorParameters<typeof Gemini>[0]) =>
  new Gemini(init);
