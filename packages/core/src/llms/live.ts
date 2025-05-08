import type { ChatMessage, LiveConnectConfig } from "./type";

export type OpenEvent = { type: "open" };

export type AudioEvent = { type: "audio"; delta: string; mimeType: string };

export type TextEvent = { type: "text"; content: string };

export type ErrorEvent = { type: "error"; error: unknown };

export type CloseEvent = { type: "close" };

export type SetupCompleteEvent = { type: "setupComplete" };

export type LiveEvent =
  | OpenEvent
  | AudioEvent
  | TextEvent
  | ErrorEvent
  | CloseEvent
  | SetupCompleteEvent;

export const liveEvents = {
  open: { include: (e: LiveEvent): e is OpenEvent => e.type === "open" },
  audio: {
    include: (e: LiveEvent): e is AudioEvent => e.type === "audio",
  },
  text: { include: (e: LiveEvent): e is TextEvent => e.type === "text" },
  error: {
    include: (e: LiveEvent): e is ErrorEvent => e.type === "error",
  },
  close: {
    include: (e: LiveEvent): e is CloseEvent => e.type === "close",
  },
  setupComplete: {
    include: (e: LiveEvent): e is SetupCompleteEvent =>
      e.type === "setupComplete",
  },
};

export abstract class LiveLLMSession {
  protected eventQueue: LiveEvent[] = [];
  protected eventResolvers: ((value: LiveEvent) => void)[] = [];
  protected closed = false;
  abstract sendMessage(message: ChatMessage): void;
  async *streamEvents(): AsyncIterable<LiveEvent> {
    while (true) {
      const event = await this.nextEvent();
      if (event === undefined) {
        break;
      }
      yield event;
    }
  }
  abstract disconnect(): Promise<void>;

  protected async nextEvent(): Promise<LiveEvent | undefined> {
    if (this.eventQueue.length) {
      return Promise.resolve(this.eventQueue.shift());
    }

    return new Promise((resolve) => {
      this.eventResolvers.push(resolve);
    });
  }

  //Uses an async queue to send events to the client
  // if the consumer is waiting for an event, it will be resolved immediately
  // otherwise, the event will be queued up and sent when the consumer is ready
  pushEventToQueue(event: LiveEvent) {
    if (this.eventResolvers.length) {
      //resolving the promise with the event
      this.eventResolvers.shift()!(event);
    } else {
      this.eventQueue.push(event);
    }
  }
}

export abstract class LiveLLM {
  abstract connect(config?: LiveConnectConfig): Promise<LiveLLMSession>;
}
