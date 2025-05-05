import {
  FunctionResponse,
  GoogleGenAI,
  Modality,
  Session,
  type FunctionDeclaration,
  type LiveConnectConfig,
  type LiveServerMessage,
} from "@google/genai";
import type { BaseTool } from "@llamaindex/core/llms";
import type { GeminiLiveEvent } from "./event";
import type {
  GeminiLiveConfig,
  GeminiLiveMessage,
  GeminiLiveMessageDetail,
} from "./types";
import {
  mapBaseToolToGeminiLiveFunctionDeclaration,
  mapResponseModalityToGeminiLiveResponseModality,
} from "./utils";

export class GeminiLive {
  private apiKey: string;
  private client: GoogleGenAI;
  private eventQueue: GeminiLiveEvent[] = [];
  private eventResolvers: ((value: GeminiLiveEvent) => void)[] = [];
  session: Session | undefined;
  closed = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
    });
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

  private handleLiveEvents(event: LiveServerMessage, toolCalls: BaseTool[]) {
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

  //Uses an async queue to send events to the client
  // if the consumer is waiting for an event, it will be resolved immediately
  // otherwise, the event will be queued up and sent when the consumer is ready
  pushEventToQueue(event: GeminiLiveEvent) {
    if (this.eventResolvers.length) {
      //resolving the promise with the event
      this.eventResolvers.shift()!(event);
    } else {
      this.eventQueue.push(event);
    }
  }

  async *streamEvents() {
    while (!this.closed) {
      const event = await this.nextEvent();
      if (event === undefined) {
        break;
      }

      yield event;
    }
  }

  private async nextEvent(): Promise<GeminiLiveEvent | undefined> {
    if (this.eventQueue.length) {
      return Promise.resolve(this.eventQueue.shift());
    }

    return new Promise((resolve) => {
      this.eventResolvers.push(resolve);
    });
  }

  private isTextMessage(content: string | GeminiLiveMessageDetail) {
    return typeof content === "string" || content?.type === "text";
  }

  private isAudioMessage(content: GeminiLiveMessageDetail) {
    return content.type === "audio";
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

  private sendAudioMessage(content: GeminiLiveMessageDetail, role?: string) {
    this.session?.sendRealtimeInput({
      audio: {
        data: content.data,
        mimeType: content.mimeType,
      },
    });
  }

  private handleUserInput(message: GeminiLiveMessage) {
    const { content, role } = message;
    if (this.isTextMessage(content)) {
      if (typeof content === "string") {
        this.sendTextMessage(content, role);
      } else {
        this.sendTextMessage(content.data, role);
      }
    } else if (this.isAudioMessage(content as GeminiLiveMessageDetail)) {
      this.sendAudioMessage(content as GeminiLiveMessageDetail, role);
    }
  }

  sendMessage(message: GeminiLiveMessage) {
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

  async connect(config?: GeminiLiveConfig) {
    const liveConfig: LiveConnectConfig = {
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

    if (config?.voiceName) {
      liveConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: config.voiceName,
          },
        },
      };
    }
    this.session = await this.client.live.connect({
      model: "gemini-2.0-flash-live-001",
      config: {
        ...liveConfig,
      },

      callbacks: {
        onmessage: (event) => {
          this.handleLiveEvents(event, config?.tools || []);
        },
        onerror: (error) => {
          this.pushEventToQueue({ type: "error", error: error.error });
        },
        onopen: () => {
          this.pushEventToQueue({ type: "open" });
        },
        onclose: () => {
          this.closed = true;
          this.pushEventToQueue({ type: "close" });
        },
      },
    });

    return this;
  }
}
