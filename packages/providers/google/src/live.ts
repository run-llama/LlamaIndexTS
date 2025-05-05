import {
  FunctionResponse,
  GoogleGenAI,
  Modality,
  Session,
  type Blob,
  type FunctionDeclaration,
  type LiveConnectConfig,
  type LiveServerMessage,
} from "@google/genai";
import type { BaseTool } from "@llamaindex/core/llms";
import type { GeminiLiveEvent } from "./event";
import type { GeminiLiveConfig } from "./types";
import { mapBaseToolToGeminiLiveFunctionDeclaration } from "./utils";

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

  sendMessage(message: string) {
    if (!this.session) {
      throw new Error("Session not connected");
    }
    this.session.sendClientContent({
      turns: [
        {
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
    });
  }

  async sendAudio(audio: { data: string; mimeType: string }) {
    if (!this.session) {
      throw new Error("Session not connected");
    }

    // If the data includes a base64 prefix, remove it
    let audioData = audio.data;

    if (audioData.indexOf(",") !== -1) {
      const parts = audioData.split(",");

      if (parts[1]) {
        audioData = parts[1];
      }
    }

    // Create the Blob object expected by the API
    const audioBlob: Blob = {
      data: audioData,
      mimeType: audio.mimeType,
    };

    // Send audio data to the model
    this.session.sendRealtimeInput({
      media: audioBlob,
    });
  }

  async disconnect() {
    if (!this.session) {
      throw new Error("Session not connected");
    }
    this.session.close();
  }

  async connect(config: GeminiLiveConfig) {
    const liveConfig: LiveConnectConfig = {
      responseModalities: config.responseModality ?? [Modality.AUDIO],
    };

    if (config.tools) {
      const tools = config.tools.map(
        mapBaseToolToGeminiLiveFunctionDeclaration,
      );
      liveConfig.tools = [
        {
          functionDeclarations: tools as FunctionDeclaration[],
        },
      ];
    }

    this.session = await this.client.live.connect({
      model: "gemini-2.0-flash-live-001",
      config: {
        ...liveConfig,
      },

      callbacks: {
        onmessage: (event) => {
          this.handleLiveEvents(event, config.tools || []);
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

    return this.session;
  }
}
