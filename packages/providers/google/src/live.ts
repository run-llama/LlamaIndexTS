import {
  FunctionResponse,
  GoogleGenAI,
  Modality,
  Session,
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

  //for the tool call event, we need to return the response with function responses
  private async handleToolCallEvent(
    event: LiveServerMessage,
    toolCalls: BaseTool[],
  ) {
    const eventToolCalls = event.toolCall?.functionCalls;

    const functionResponses: FunctionResponse[] = [];

    if (eventToolCalls) {
      for (const toolCall of eventToolCalls) {
        const tool = toolCalls.find((t) => t.metadata.name === toolCall.name);
        if (tool && tool.call) {
          //call tool call and store the result of each tool call in list
          const response = await tool.call(toolCall.args);
          functionResponses.push({
            id: toolCall.id || "",
            name: toolCall.name || "",
            response:
              typeof response === "string"
                ? { result: response }
                : (response as Record<string, unknown>),
          });
        }
      }
      //send the function responses to the gemini
      this.session?.sendToolResponse({
        functionResponses,
      });
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
    /* Only 2.0 flash live is supported for live mode */
    this.model = GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE;
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

    const session = new GeminiLiveSession();

    session.session = await this.client.live.connect({
      model: "gemini-2.0-flash-live-001",
      config: {
        ...liveConfig,
      },

      callbacks: {
        onmessage: (event) => {
          session.handleLiveEvents(event, config?.tools || []);
        },
        onerror: (error) => {
          session.pushEventToQueue({ type: "error", error: error.error });
        },
        onopen: () => {
          session.pushEventToQueue({ type: "open" });
        },
        onclose: () => {
          session.pushEventToQueue({ type: "close" });
        },
      },
    });

    return session;
  }
}
