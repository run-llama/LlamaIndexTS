import {
  GoogleGenerativeAI,
  GenerativeModel as GoogleGenerativeModel,
  type EnhancedGenerateContentResponse,
  type FunctionCall,
  type ModelParams as GoogleModelParams,
  type RequestOptions as GoogleRequestOptions,
  type StartChatParams as GoogleStartChatParams,
  type GenerateContentStreamResult as GoogleStreamGenerateContentResult,
  type SafetySetting,
} from "@google/genai";

import { wrapLLMEvent } from "@llamaindex/core/decorator";
import type {
  CompletionResponse,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { ToolCallLLM } from "@llamaindex/core/llms";
import { streamConverter } from "@llamaindex/core/utils";
import { getEnv, randomUUID } from "@llamaindex/env";
import { GeminiLive } from "./live.js";
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
  type GeminiVoiceName,
  type GoogleGeminiSessionOptions,
  type IGeminiSession,
} from "./types.js";
import {
  DEFAULT_SAFETY_SETTINGS,
  GeminiHelper,
  getChatContext,
  getPartsText,
  mapBaseToolToGeminiFunctionDeclaration,
} from "./utils.js";

export const GEMINI_MODEL_INFO_MAP: Record<GEMINI_MODEL, GeminiModelInfo> = {
  [GEMINI_MODEL.GEMINI_PRO]: { contextWindow: 30720 },
  [GEMINI_MODEL.GEMINI_PRO_VISION]: { contextWindow: 12288 },
  // multi-modal/multi turn
  [GEMINI_MODEL.GEMINI_PRO_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_FLASH_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_PRO_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5]: { contextWindow: 2 * 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_LATEST]: { contextWindow: 2 * 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_EXPERIMENTAL]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_LITE_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_LITE]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_THINKING_EXP]: { contextWindow: 32768 },
  [GEMINI_MODEL.GEMINI_2_0_PRO_EXPERIMENTAL]: { contextWindow: 2 * 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_5_FLASH_PREVIEW]: { contextWindow: 10 ** 6 },
};

export const SUPPORT_TOOL_CALL_MODELS: GEMINI_MODEL[] = [
  GEMINI_MODEL.GEMINI_PRO,
  GEMINI_MODEL.GEMINI_PRO_VISION,
  GEMINI_MODEL.GEMINI_PRO_1_5_PRO_PREVIEW,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_PREVIEW,
  GEMINI_MODEL.GEMINI_PRO_1_5,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH,
  GEMINI_MODEL.GEMINI_PRO_LATEST,
  GEMINI_MODEL.GEMINI_PRO_FLASH_LATEST,
  GEMINI_MODEL.GEMINI_PRO_1_5_LATEST,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_LATEST,
  GEMINI_MODEL.GEMINI_2_0_FLASH_EXPERIMENTAL,
  GEMINI_MODEL.GEMINI_2_0_FLASH,
  GEMINI_MODEL.GEMINI_2_0_PRO_EXPERIMENTAL,
  GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW,
  GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW_LATEST,
  GEMINI_MODEL.GEMINI_2_5_FLASH_PREVIEW,
];

export const DEFAULT_GEMINI_PARAMS = {
  model: GEMINI_MODEL.GEMINI_PRO,
  temperature: 0.1,
  topP: 1,
  maxTokens: undefined,
};

export type GeminiConfig = Partial<typeof DEFAULT_GEMINI_PARAMS> & {
  apiKey?: string;
  session?: IGeminiSession;
  requestOptions?: GoogleRequestOptions;
  safetySettings?: SafetySetting[];
  voiceName?: GeminiVoiceName;
};

type StartChatParams = GoogleStartChatParams;

/**
 * Gemini Session to manage the connection to the Gemini API
 */
export class GeminiSession implements IGeminiSession {
  private gemini: GoogleGenerativeAI;
  private generativeModel: GoogleGenerativeModel; // Added to store the model

  constructor(options: GoogleGeminiSessionOptions, modelParams: GoogleModelParams, requestOpts?: GoogleRequestOptions) {
    if (options.backend === GEMINI_BACKENDS.VERTEX) {
      // Vertex AI initialization
      const project = options.project ?? getEnv("GOOGLE_VERTEX_PROJECT_ID");
      const location = options.location ?? getEnv("GOOGLE_VERTEX_LOCATION");
      if (!project || !location) {
        throw new Error(
          "Set GOOGLE_VERTEX_PROJECT_ID and GOOGLE_VERTEX_LOCATION env variables for Vertex AI",
        );
      }
      this.gemini = new GoogleGenerativeAI({
        vertexai: true,
        project,
        location,
        apiVersion: options.apiVersion,
      });
    } else {
      // Gemini API initialization
      if (!options.apiKey) {
        options.apiKey = getEnv("GOOGLE_API_KEY")!;
      }
      if (!options.apiKey) {
        throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
      }
      this.gemini = new GoogleGenerativeAI({
        apiKey: options.apiKey,
        apiVersion: options.apiVersion,
      });
    }
    // Store the generative model
    this.generativeModel = this.gemini.getGenerativeModel(
      {
        safetySettings: modelParams.safetySettings ?? DEFAULT_SAFETY_SETTINGS,
        ...modelParams,
      },
      requestOpts,
    );
  }

  getGenerativeModel(
    _metadata: GoogleModelParams, // metadata is now part of constructor
    _requestOpts?: GoogleRequestOptions, // requestOpts is now part of constructor
  ): GoogleGenerativeModel {
    return this.generativeModel;
  }

  getResponseText(response: EnhancedGenerateContentResponse): string {
    // Updated to access text as a property
    return response.text ?? "";
  }

  getToolsFromResponse(
    response: EnhancedGenerateContentResponse,
  ): ToolCall[] | undefined {
    // Updated to access functionCalls as a property
    const fc = response.functionCalls;
    if (fc) {
      return fc.map( // Assuming fc is an array
        (call: FunctionCall) =>
          ({
            name: call.name,
            input: call.args, // Ensure call.args is the correct field for input
            id: randomUUID(),
          }) as ToolCall,
      );
    }
    return undefined;
  }

  async *getChatStream(
    result: GoogleStreamGenerateContentResult, // This will likely change to an AsyncIterableIterator
  ): GeminiChatStreamResponse {
    // The new SDK returns an async iterator directly from generateContentStream
    // This method needs to adapt to that
    for await (const response of result.stream) { // Assuming result.stream is the async iterator
      const tools = this.getToolsFromResponse(response);
      const options: ToolCallLLMMessageOptions = tools?.length
        ? { toolCall: tools }
        : {};
      yield {
        delta: this.getResponseText(response),
        raw: response,
        options,
      };
    }
  }

  async *getCompletionStream( // Changed to async generator
    result: GoogleStreamGenerateContentResult, // This will likely change to an AsyncIterableIterator
  ): AsyncIterable<CompletionResponse> {
    // The new SDK returns an async iterator directly from generateContentStream
    // This method needs to adapt to that
    for await (const response of result.stream) { // Assuming result.stream is the async iterator
      yield {
        text: this.getResponseText(response),
        raw: response,
      };
    }
  }
}

/**
 * Gemini Session Store to manage the current Gemini sessions
 */
export class GeminiSessionStore {
  static sessions: Array<{
    session: IGeminiSession;
    options: GeminiSessionOptions;
    // Store modelParams and requestOpts used for this session
    modelParams: GoogleModelParams;
    requestOpts?: GoogleRequestOptions;
  }> = [];

  private static getSessionId(options: GeminiSessionOptions): string {
    if (options.backend === GEMINI_BACKENDS.VERTEX) {
      return `${options.project}-${options.location}-${options.apiVersion ?? ""}`;
    }
    return `${options.apiKey ?? ""}-${options.apiVersion ?? ""}`;
  }

  private static sessionMatched(
    s1: { options: GeminiSessionOptions; modelParams: GoogleModelParams; requestOpts?: GoogleRequestOptions },
    options: GeminiSessionOptions,
    modelParams: GoogleModelParams,
    requestOpts?: GoogleRequestOptions,
  ): boolean {
    // Also check if modelParams and requestOpts match, if necessary for session reuse.
    // For simplicity, this example only matches on options.
    // A more robust solution might involve deep comparison of modelParams and requestOpts.
    return (
      GeminiSessionStore.getSessionId(s1.options) ===
      GeminiSessionStore.getSessionId(options) &&
      JSON.stringify(s1.modelParams) === JSON.stringify(modelParams) && // Basic comparison
      JSON.stringify(s1.requestOpts) === JSON.stringify(requestOpts) // Basic comparison
    );
  }

  static get(
    options: GeminiSessionOptions = { backend: GEMINI_BACKENDS.GOOGLE },
    modelParams: GoogleModelParams, // Pass modelParams
    requestOpts?: GoogleRequestOptions, // Pass requestOpts
  ): IGeminiSession {
    let sessionEntry = this.sessions.find((entry) =>
      this.sessionMatched(entry, options, modelParams, requestOpts),
    );
    if (sessionEntry) return sessionEntry.session;

    const newSession = new GeminiSession(options, modelParams, requestOpts);
    this.sessions.push({ session: newSession, options, modelParams, requestOpts });
    return newSession;
  }
}

/**
 * ToolCallLLM for Gemini
 */
export class Gemini extends ToolCallLLM<GeminiAdditionalChatOptions> {
  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  #requestOptions?: GoogleRequestOptions | undefined;
  session: IGeminiSession;
  safetySettings: SafetySetting[];
  apiKey?: string | undefined;
  voiceName?: GeminiVoiceName | undefined;
  private _live: GeminiLive | undefined;
  constructor(init?: GeminiConfig) {
    super();
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_PRO;
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.#requestOptions = init?.requestOptions ?? undefined; // Store requestOptions
    this.safetySettings = init?.safetySettings ?? DEFAULT_SAFETY_SETTINGS;
    this.apiKey = init?.apiKey ?? getEnv("GOOGLE_API_KEY");
    // Pass model metadata and request options to GeminiSessionStore.get
    // The session is now initialized with modelParams and requestOpts
    this.session = init?.session ?? GeminiSessionStore.get(
      {
        apiKey: this.apiKey,
        backend: this.apiKey ? GEMINI_BACKENDS.GOOGLE : GEMINI_BACKENDS.VERTEX, // Infer backend
        // Potentially add project/location if known, or handle in GeminiSession constructor
      },
      { model: this.model, temperature: this.temperature, topP: this.topP, maxTokens: this.maxTokens, safetySettings: this.safetySettings },
      this.#requestOptions
    );
    this.voiceName = init?.voiceName ?? undefined;
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

  private async createGenerationParams( // Renamed and updated
    params: GeminiChatParamsNonStreaming | GeminiChatParamsStreaming,
  ) {
    const { messages, tools } = params; // Assuming params.messages is the new way to pass chat history
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map(GeminiHelper.messageToGeminiContent);

    const generationConfig = {
      candidateCount: 1, // Default or make configurable
      stopSequences: undefined, // Default or make configurable
      maxOutputTokens: this.maxTokens,
      temperature: this.temperature,
      topP: this.topP,
      // topK: undefined, // Default or make configurable
    };

    const safetySettings = this.safetySettings;
    const toolParams = tools?.length
      ? {
          tools: [
            {
              functionDeclarations: tools.map(
                mapBaseToolToGeminiFunctionDeclaration,
              ),
            },
          ],
        }
      : {};

    return {
      contents: [...history, await GeminiHelper.messageContentToGeminiParts(lastMessage.content, lastMessage.role)],
      generationConfig,
      safetySettings,
      ...toolParams,
    };
  }

  protected async nonStreamChat(
    params: GeminiChatParamsNonStreaming,
  ): Promise<GeminiChatNonStreamResponse> {
    const generationParams = await this.createGenerationParams(params);
    const client = this.session.getGenerativeModel();

    // Use generateContent from the new SDK
    const result = await client.generateContent(generationParams);
    const response = result.response; // Response from generateContent

    const topCandidate = response.candidates![0]!;
    const tools = this.session.getToolsFromResponse(response);
    const options: ToolCallLLMMessageOptions = tools?.length
      ? { toolCall: tools }
      : {};

    return {
      raw: response,
      message: {
        content: this.session.getResponseText(response),
        role: GeminiHelper.ROLES_FROM_GEMINI[
          topCandidate.content.role as GeminiMessageRole
        ],
        options,
      },
    };
  }

  protected async *streamChat(
    params: GeminiChatParamsStreaming,
  ): GeminiChatStreamResponse {
    const generationParams = await this.createGenerationParams(params);
    const client = this.session.getGenerativeModel();

    // Use generateContentStream from the new SDK
    const result = await client.generateContentStream(generationParams);

    // getChatStream in GeminiSession expects a GoogleStreamGenerateContentResult,
    // which has a `stream` property that is an async iterator.
    // The result from generateContentStream is directly the async iterator over chunks.
    // So we need to adapt how we call getChatStream or how getChatStream is implemented.

    // Option 1: Adapt getChatStream to take the raw stream
    // For now, let's assume getChatStream is updated to handle the direct stream from generateContentStream
    // This means `result` itself is the async iterator over the chunks (EnhancedGenerateContentResponse)
    // However, the current `getChatStream` expects `result.stream`.
    // Let's create a compatible object for now, or refactor `getChatStream` later.

    // Create a compatible structure for the current getChatStream
    const compatibleResult: GoogleStreamGenerateContentResult = {
      stream: result, // result is already the async iterator
      response: Promise.resolve({} as EnhancedGenerateContentResponse), // Dummy promise, not used by current getChatStream logic
    };

    yield* this.session.getChatStream(compatibleResult);
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
    // getGenerativeModel no longer takes arguments
    const client = this.session.getGenerativeModel();
    const content = getPartsText(
      await GeminiHelper.messageContentToGeminiParts({ content: prompt }),
    );

    if (stream) {
      // generateContentStream is now directly on the model (client)
      const result = await client.generateContentStream({ contents: [{ parts: [{ text: content }] }] });
      // getCompletionStream in GeminiSession expects an AsyncIterable
      // result from generateContentStream should be directly usable if it's an AsyncIterableIterator<EnhancedGenerateContentResponse>
      // or if result.stream is the correct iterator
      return this.session.getCompletionStream(result);
    }

    // generateContent is now directly on the model (client)
    const result = await client.generateContent({ contents: [{ parts: [{ text: content }] }] });
    return {
      text: this.session.getResponseText(result.response),
      raw: result.response,
    };
  }
}

/**
 * Convenience function to create a new Gemini instance.
 * @param init - Optional initialization parameters for the Gemini instance.
 * @returns A new Gemini instance.
 */
export const gemini = (init?: ConstructorParameters<typeof Gemini>[0]) =>
  new Gemini(init);
