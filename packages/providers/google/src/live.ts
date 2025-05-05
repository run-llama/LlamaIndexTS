import { GoogleGenAI, Modality, Session, type Blob } from "@google/genai";
import type { GeminiLiveEvent } from "./event";

export class GeminiLiveSession {
  private eventQueue: GeminiLiveEvent[] = [];
  private eventResolvers: ((value: GeminiLiveEvent) => void)[] = [];
  session: Session | undefined;
  closed = false;

  constructor() {}

  //Uses an async queue to send events to the client
  // if the consumer is waiting for an event, it will be resolved immediately
  // otherwise, the event will be queued up and sent when the consumer is ready
  pushEventInQueue(event: GeminiLiveEvent) {
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
      mimeType: audio.mimeType, // e.g., "audio/webm", "audio/wav"
    };

    // Send audio data to the model
    this.session.sendRealtimeInput({
      media: audioBlob,
    });
  }

  // async sendToolResponse(toolResponse: string) {
  //   await this.session.sendToolResponse({
  //     turns: [

  //     ]
  //   })
  // }

  async disconnect() {
    if (!this.session) {
      throw new Error("Session not connected");
    }
    this.session.close();
  }
}

export class GeminiLive {
  private apiKey: string;
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
    });
  }

  async connect() {
    const session = new GeminiLiveSession();
    const googleSession = await this.client.live.connect({
      model: "gemini-2.0-flash-live-001",
      config: {
        responseModalities: [Modality.TEXT],
      },
      callbacks: {
        onmessage: (event) => {
          const message = event.serverContent?.modelTurn?.parts?.[0];
          if (message?.text) {
            session.pushEventInQueue({ type: "text", content: message.text });
          }

          if (event.setupComplete) {
            session.pushEventInQueue({ type: "setupComplete" });
          }

          if (event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            session.pushEventInQueue({
              type: "audio",
              delta:
                event.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data,
            });
          }
        },
        onerror: (error) => {
          session.pushEventInQueue({ type: "error", error: error.error });
        },
        onopen: () => {
          session.pushEventInQueue({ type: "open" });
        },
        onclose: () => {
          session.closed = true;
          session.pushEventInQueue({ type: "close" });
        },
      },
    });

    session.session = googleSession;
    return session;
  }
}
