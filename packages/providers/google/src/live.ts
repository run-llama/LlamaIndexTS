import {
  FunctionResponse,
  GoogleGenAI,
  Modality,
  Session,
  type FunctionCall,
  type FunctionDeclaration,
  type LiveConnectConfig as GoogleLiveConnectConfig,
  type LiveServerMessage,
} from "@google/genai";
import {
  LiveLLM,
  LiveLLMSession,
  type BaseTool,
  type ChatMessage,
  type LiveConnectConfig,
  type MessageContentAudioDetail,
  type MessageContentDetail,
  type MessageContentImageDataDetail,
  type MessageContentVideoDetail,
} from "@llamaindex/core/llms";
import { getEnv } from "@llamaindex/env";
import { GEMINI_MODEL, type GeminiVoiceName } from "./types";
import {
  mapBaseToolToGeminiLiveFunctionDeclaration,
  mapResponseModalityToGeminiLiveResponseModality,
} from "./utils";

interface GeminiLiveConfig {
  apiKey?: string | undefined;
  voiceName?: GeminiVoiceName | undefined;
  model?: GEMINI_MODEL | undefined;
}

export class GeminiLiveSession extends LiveLLMSession {
  session: Session | undefined;
  closed = false;

  constructor() {
    super();
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

  private isTextMessage(content: MessageContentDetail) {
    return content.type === "text";
  }

  private isAudioMessage(content: MessageContentDetail) {
    return content.type === "audio";
  }

  private isImageMessage(content: MessageContentDetail) {
    return content.type === "image";
  }

  private isVideoMessage(content: MessageContentDetail) {
    return content.type === "video";
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
        content: event.serverContent?.modelTurn?.parts?.[0]?.text || "",
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
        delta:
          event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data || "",
        mimeType:
          event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.mimeType ||
          "audio/wav",
      });
    }
    if (this.isToolCallEvent(event)) {
      this.handleToolCallEvent(event, toolCalls);
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

  private sendTextMessage(message: string, role?: string) {
    this.session?.sendClientContent({
      turns: [
        {
          parts: [{ text: message }],
          ...(role ? { role } : {}),
        },
      ],
    });
  }

  private sendAudioMessage(content: MessageContentAudioDetail, role?: string) {
    if (typeof content.data === "string") {
      this.session?.sendRealtimeInput({
        audio: {
          data: content.data,
          mimeType: content.mimeType,
        },
      });
    } else {
      this.session?.sendRealtimeInput({
        audio: {
          data: content.data.toString("base64"),
          mimeType: content.mimeType,
        },
      });
    }
  }

  private sendImageMessage(
    content: MessageContentImageDataDetail,
    role?: string,
  ) {
    if (typeof content.data === "string") {
      this.session?.sendRealtimeInput({
        media: {
          data: content.data,
          mimeType: content.mimeType,
        },
      });
    } else {
      this.session?.sendRealtimeInput({
        media: {
          data: content.data.toString("base64"),
          mimeType: content.mimeType,
        },
      });
    }
  }

  private sendVideoMessage(content: MessageContentVideoDetail, role?: string) {
    if (typeof content.data === "string") {
      this.session?.sendRealtimeInput({
        video: {
          data: content.data,
          mimeType: content.mimeType,
        },
      });
    } else {
      this.session?.sendRealtimeInput({
        video: {
          data: content.data.toString("base64"),
          mimeType: content.mimeType,
        },
      });
    }
  }

  private handleUserInput(message: ChatMessage) {
    const { content, role } = message;

    if (!Array.isArray(content)) {
      this.sendTextMessage(content, role);
    } else {
      for (const item of content) {
        if (this.isTextMessage(item)) {
          this.sendTextMessage(item.text, role);
        } else if (this.isAudioMessage(item)) {
          this.sendAudioMessage(item as MessageContentAudioDetail, role);
        } else if (this.isImageMessage(item)) {
          this.sendImageMessage(item as MessageContentImageDataDetail, role);
        } else if (this.isVideoMessage(item)) {
          this.sendVideoMessage(item as MessageContentVideoDetail, role);
        }
      }
    }
  }

  sendMessage(message: ChatMessage) {
    if (!this.session) {
      throw new Error("Session not connected");
    }
    this.handleUserInput(message);
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

  constructor(init?: GeminiLiveConfig) {
    super();
    this.apiKey = init?.apiKey ?? getEnv("GOOGLE_API_KEY");

    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
    });
    this.voiceName = init?.voiceName;
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE;
    /* Only 2.0 flash live is supported for live mode */
    if (this.model !== GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE) {
      throw new Error("Only GEMINI_2_0_FLASH_LIVE is supported for live mode");
    }
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
