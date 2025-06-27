import {
  GoogleGenAI,
  type FunctionCall,
  type Content as GeminiMessage,
  type GenerateContentConfig,
  type GoogleGenAIOptions,
  type HttpOptions,
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
import { GEMINI_MESSAGE_ROLE, GEMINI_MODEL } from "./constants";
import {
  DEFAULT_SAFETY_SETTINGS,
  GEMINI_MODEL_INFO_MAP,
  ROLES_FROM_GEMINI,
  ROLES_TO_GEMINI,
  SUPPORT_TOOL_CALL_MODELS,
} from "./constants.js";
import { GeminiLive, type GeminiVoiceName } from "./live.js";
import {
  mapBaseToolToGeminiFunctionDeclaration,
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

export type GeminiConfig = {
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
  private client: GoogleGenAI;

  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  safetySettings: SafetySetting[];
  apiKey?: string | undefined;

  private _live: GeminiLive | undefined;

  voiceName?: GeminiVoiceName | undefined;
  httpOptions?: HttpOptions | undefined;

  constructor(init?: GeminiConfig) {
    super();
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_PRO;
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.safetySettings = init?.safetySettings ?? DEFAULT_SAFETY_SETTINGS;
    this.voiceName = init?.voiceName;
    this.httpOptions = init?.httpOptions;
    this.apiKey = init?.apiKey ?? getEnv("GOOGLE_API_KEY");

    if (!this.apiKey) {
      throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
    }

    if (init?.vertexai) {
      // Project/location and API key are mutually exclusive in the client initializer for Vertex AI
      // So that we either need to provide project/location or apiKey
      // See: https://github.com/googleapis/js-genai/blob/58a369ed36cd05be652c2279dcc9634fffc9fc10/src/node/node_client.ts#L89-L93
      if (init?.project && init?.location) {
        // when using Vertex AI, if project and location are provided, use them to create the client
        this.client = new GoogleGenAI({
          project: init.project,
          location: init.location,
        });
      } else {
        // when using Vertex AI, if project and location are not provided, use apiKey to create the client
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      }
    } else {
      this.client = new GoogleGenAI({ ...init, apiKey: this.apiKey });
    }
  }

  get supportToolCall(): boolean {
    return SUPPORT_TOOL_CALL_MODELS.includes(this.model);
  }

  get live(): GeminiLive {
    if (!this._live) {
      this._live = new GeminiLive({
        apiKey: this.apiKey,
        voiceName: this.voiceName,
        model: this.model,
        httpOptions: this.httpOptions,
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

  get generationConfig(): GenerateContentConfig {
    return {
      temperature: this.temperature,
      topP: this.topP,
      safetySettings: this.safetySettings,
      ...(this.maxTokens ? { maxOutputTokens: this.maxTokens } : {}),
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
    const config = this.prepareChatConfig(params);
    const { message, history } = await this.prepareChatContext(params.messages);

    const chat = this.client.chats.create({
      model: this.model,
      config,
      history,
    });

    const response = await chat.sendMessage({ message });

    const topCandidate = response.candidates?.[0];
    const geminiRole = topCandidate?.content?.role ?? GEMINI_MESSAGE_ROLE.MODEL;
    const toolCall = response.functionCalls?.map((call) => ({
      id: call.id ?? randomUUID(),
      name: call.name,
      input: call.args,
    }));

    return {
      message: {
        content: response.text ?? "",
        role: ROLES_FROM_GEMINI[geminiRole as GEMINI_MESSAGE_ROLE],
        options: toolCall?.length ? { toolCall } : undefined,
      },
      raw: response,
    };
  }

  private async streamChat(
    params: GeminiChatParamsStreaming,
  ): Promise<GeminiChatStreamResponse> {
    const config = this.prepareChatConfig(params);
    const { message, history } = await this.prepareChatContext(params.messages);

    console.log("history", JSON.stringify(history, null, 2));
    console.log("message", JSON.stringify(message, null, 2));

    const chat = this.client.chats.create({
      model: this.model,
      config,
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

    const generator = await this.client.models.generateContentStream({
      model: this.model,
      contents,
      config: this.generationConfig,
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

    const result = await this.client.models.generateContent({
      model: this.model,
      config: this.generationConfig,
      contents,
    });

    return {
      text: result.text ?? "",
      raw: result,
    };
  }

  private prepareChatConfig(
    params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
  ): GenerateContentConfig {
    const config = { ...this.generationConfig };

    const functionDeclarations =
      params.tools?.map(mapBaseToolToGeminiFunctionDeclaration) ?? [];

    if (functionDeclarations.length) {
      config.tools = [{ functionDeclarations }];
    }

    return config;
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
    // map tool call id to tool name
    const toolMap = messages.reduce(
      (result, message) => {
        const { options } = message;
        if (options && "toolCall" in options) {
          options.toolCall.forEach((call) => {
            result[call.id] = call.name;
          });
        }
        return result;
      },
      {} as Record<string, string>,
    );

    const geminiMessages = await Promise.all(
      messages.map(async (m) => ({
        role: ROLES_TO_GEMINI[m.role],
        parts: await this.messageToGeminiParts(m, toolMap),
      })),
    );
    const mergedMessages = mergeNeighboringSameRoleMessages(geminiMessages);

    return {
      history: mergedMessages.slice(0, -1),
      message: mergedMessages[mergedMessages.length - 1]?.parts || [],
    };
  }

  private async messageToGeminiParts(
    message: ChatMessage<ToolCallLLMMessageOptions>,
    toolMap: Record<string, string>,
  ): Promise<Part[]> {
    const { options, content } = message;

    // if message has toolResult, return a gemini function response part
    if (options && "toolResult" in options) {
      const { id, result } = options.toolResult;

      const name = toolMap[id];
      if (!name) {
        throw Error(`Could not find the tool name with id ${id}`);
      }

      return [{ functionResponse: { id, name, response: { result } } }];
    }

    // if message has toolCall, return a list of gemini function call parts
    if (options && "toolCall" in options) {
      return options.toolCall.map((call) => ({
        functionCall: {
          id: call.id,
          name: call.name,
          args: call.input,
        } as FunctionCall,
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
    return await Promise.all(
      content.map((item) =>
        messageContentDetailToGeminiPart(item, this.client),
      ),
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
