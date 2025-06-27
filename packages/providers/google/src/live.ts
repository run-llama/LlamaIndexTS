import {
  FunctionResponse,
  GoogleGenAI,
  Modality,
  Session,
  type FunctionCall,
  type FunctionDeclaration,
  type LiveConnectConfig as GoogleLiveConnectConfig,
  type HttpOptions,
  type LiveServerMessage,
} from "@google/genai";
import {
  LiveLLM,
  LiveLLMSession,
  type BaseTool,
  type LiveConnectConfig,
  type MessageSender,
} from "@llamaindex/core/llms";
import { getEnv } from "@llamaindex/env";
import { GEMINI_MODEL } from "./constants";
import { GeminiMessageSender } from "./message-sender";
import {
  mapBaseToolToGeminiLiveFunctionDeclaration,
  mapResponseModalityToGeminiLiveResponseModality,
} from "./utils";

export type GeminiVoiceName =
  | "Puck"
  | "Charon"
  | "Fenrir"
  | "Aoede"
  | "Leda"
  | "Kore"
  | "Orus"
  | "Zephyr";

export interface GeminiLiveConfig {
  apiKey?: string | undefined;
  voiceName?: GeminiVoiceName | undefined;
  model?: GEMINI_MODEL | undefined;
  httpOptions?: HttpOptions | undefined;
}

export class GeminiLiveSession extends LiveLLMSession {
  session: Session | undefined;
  closed = false;

  constructor() {
    super();
  }

  get messageSender(): MessageSender {
    return new GeminiMessageSender(this);
  }

  private isInterruptedEvent(event: LiveServerMessage): boolean {
    return event.serverContent?.interrupted === true;
  }

  private isGenerationCompleteEvent(event: LiveServerMessage): boolean {
    return event.serverContent?.generationComplete === true;
  }

  private isTurnCompleteEvent(event: LiveServerMessage): boolean {
    return event.serverContent?.turnComplete === true;
  }

  private isTextEvent(event: LiveServerMessage): boolean {
    return event.serverContent?.modelTurn?.parts?.[0]?.text !== undefined;
  }

  private isAudioEvent(event: LiveServerMessage): boolean {
    return (
      event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data !== undefined
    );
  }

  private isToolCallEvent(event: LiveServerMessage): boolean {
    return event.toolCall !== undefined;
  }

  private isSetupCompleteEvent(event: LiveServerMessage): boolean {
    return event.setupComplete !== undefined;
  }

  //for the tool call event, we need to return the response with function responses
  private async handleToolCallEvent(
    event: LiveServerMessage,
    toolCalls: BaseTool[],
  ) {
    const eventToolCalls = event.toolCall?.functionCalls;

    if (eventToolCalls) {
      await this.sendToolCallResponses(eventToolCalls, toolCalls);
    }
  }

  handleLiveEvents(event: LiveServerMessage, toolCalls: BaseTool[]) {
    if (this.isTextEvent(event)) {
      this.pushEventToQueue({
        type: "text",
        text: event.serverContent?.modelTurn?.parts?.[0]?.text || "",
      });
    }
    if (this.isSetupCompleteEvent(event)) {
      this.pushEventToQueue({
        type: "setupComplete",
      });
    }
    if (this.isAudioEvent(event)) {
      this.pushEventToQueue({
        type: "audio",
        data:
          event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data || "",
        mimeType:
          event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.mimeType ||
          "audio/wav",
      });
    }
    if (this.isToolCallEvent(event)) {
      this.handleToolCallEvent(event, toolCalls);
    }
    if (this.isInterruptedEvent(event)) {
      this.pushEventToQueue({
        type: "interrupted",
      });
    }
    if (this.isGenerationCompleteEvent(event)) {
      this.pushEventToQueue({
        type: "generationComplete",
      });
    }
    if (this.isTurnCompleteEvent(event)) {
      this.pushEventToQueue({
        type: "turnComplete",
      });
    }
  }

  private executeToolCall(toolCall: FunctionCall, tool: BaseTool) {
    return tool.call!(toolCall.args);
  }

  private storeToolCallResponse(
    toolCall: FunctionCall,
    response: unknown,
    functionResponses: FunctionResponse[],
  ) {
    functionResponses.push({
      id: toolCall.id || "",
      name: toolCall.name || "",
      response:
        typeof response === "string"
          ? { result: response }
          : (response as Record<string, unknown>),
    });
  }

  private async executeToolCallsAndStoreResponses(
    eventToolCalls: FunctionCall[],
    toolCalls: BaseTool[],
  ) {
    const functionResponses: FunctionResponse[] = [];

    for (const toolCall of eventToolCalls) {
      const tool = toolCalls.find((t) => t.metadata.name === toolCall.name);
      if (tool && tool.call) {
        const response = await this.executeToolCall(toolCall, tool);
        this.storeToolCallResponse(toolCall, response, functionResponses);
      }
    }

    return functionResponses;
  }

  //execute the tool call and send the response to the server
  private async sendToolCallResponses(
    eventToolCalls: FunctionCall[],
    toolCalls: BaseTool[],
  ) {
    let functionResponses: FunctionResponse[] = [];

    if (eventToolCalls) {
      functionResponses = await this.executeToolCallsAndStoreResponses(
        eventToolCalls,
        toolCalls,
      );
      //send the function responses to the gemini
      this.session?.sendToolResponse({
        functionResponses,
      });
    }
  }

  async disconnect() {
    if (!this.session) {
      throw new Error("Session not connected");
    }

    this.session.close();
  }
}
export class GeminiLive extends LiveLLM {
  private apiKey: string | undefined;
  private client: GoogleGenAI;
  voiceName?: GeminiVoiceName | undefined;
  model: GEMINI_MODEL;
  httpOptions?: HttpOptions | undefined;

  constructor(init?: GeminiLiveConfig) {
    super();
    this.apiKey = init?.apiKey ?? getEnv("GOOGLE_API_KEY");
    this.httpOptions = init?.httpOptions;

    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
      ...(this.httpOptions ? { httpOptions: this.httpOptions } : {}),
    });
    this.voiceName = init?.voiceName;
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE;
    /* Only 2.0 flash live is supported for live mode */
    if (this.model !== GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE) {
      throw new Error("Only GEMINI_2_0_FLASH_LIVE is supported for live mode");
    }
  }

  async getEphemeralKey(): Promise<string> {
    if (this.httpOptions?.apiVersion !== "v1alpha") {
      // see: https://github.com/googleapis/js-genai/issues/691#issuecomment-3002302279
      throw new Error("Ephemeral key generation is only supported in v1alpha");
    }

    const token = await this.client.authTokens.create({
      config: {
        liveConnectConstraints: {
          model: this.model,
          config: {
            responseModalities: [Modality.AUDIO],
          },
        },
        httpOptions: this.httpOptions,
      },
    });
    if (!token.name) {
      throw new Error("Failed to generate ephemeral key");
    }

    return token.name;
  }

  async connect(config?: LiveConnectConfig) {
    const liveConfig: GoogleLiveConnectConfig = {
      responseModalities: config?.responseModality
        ? config.responseModality.map(
            mapResponseModalityToGeminiLiveResponseModality,
          )
        : [Modality.AUDIO],
    };

    if (config?.tools) {
      const tools = config.tools.map(
        mapBaseToolToGeminiLiveFunctionDeclaration,
      );
      liveConfig.tools = [
        {
          functionDeclarations: tools as FunctionDeclaration[],
        },
      ];
    }

    if (config?.systemInstruction) {
      liveConfig.systemInstruction = config.systemInstruction;
    }

    if (this.voiceName) {
      liveConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: this.voiceName,
          },
        },
      };
    }

    if (config?.audioConfig) {
      throw new Error(
        "Audio config is not supported for Gemini Live, directly send and recieve audio events instead",
      );
    }

    const geminiLiveSession = new GeminiLiveSession();

    geminiLiveSession.session = await this.client.live.connect({
      model: this.model,
      config: {
        ...liveConfig,
      },

      callbacks: {
        onmessage: (event) => {
          geminiLiveSession.handleLiveEvents(event, config?.tools || []);
        },
        onerror: (error) => {
          geminiLiveSession.pushEventToQueue({
            type: "error",
            error: error.error,
          });
        },
        onopen: () => {
          geminiLiveSession.pushEventToQueue({ type: "open" });
        },
        onclose: () => {
          geminiLiveSession.pushEventToQueue({ type: "close" });
        },
      },
    });

    return geminiLiveSession;
  }
}
