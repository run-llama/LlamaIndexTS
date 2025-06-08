import type {
  ChatMessage,
  LiveConnectConfig,
  MessageContentAudioDetail,
  MessageContentDetail,
  MessageContentTextDetail,
} from "../type";
import { MessageHandler, MessageHandlerFactory } from "./message-handler";
import type { MessageSenderFactory } from "./sender";
export type OpenEvent = { type: "open" };

export type AudioEvent = MessageContentAudioDetail;

export type TextEvent = MessageContentTextDetail;

export type ErrorEvent = { type: "error"; error: unknown };

export type CloseEvent = { type: "close" };

export type SetupCompleteEvent = { type: "setupComplete" };

// a client message has interrupted current model generation
export type InterruptedEvent = { type: "interrupted" };

export type GenerationCompleteEvent = { type: "generationComplete" };

export type TurnCompleteEvent = { type: "turnComplete" };

export type LiveEvent =
  | OpenEvent
  | AudioEvent
  | TextEvent
  | ErrorEvent
  | CloseEvent
  | SetupCompleteEvent
  | InterruptedEvent
  | GenerationCompleteEvent
  | TurnCompleteEvent;

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
  interrupted: {
    include: (e: LiveEvent): e is InterruptedEvent => e.type === "interrupted",
  },
  generationComplete: {
    include: (e: LiveEvent): e is GenerationCompleteEvent =>
      e.type === "generationComplete",
  },
  turnComplete: {
    include: (e: LiveEvent): e is TurnCompleteEvent =>
      e.type === "turnComplete",
  },
};
export abstract class LiveLLMSession {
  protected eventQueue: LiveEvent[] = [];
  protected eventResolvers: ((value: LiveEvent) => void)[] = [];
  protected closed = false;

  protected messageHandlers: MessageHandler[] = [];

  constructor(senderFactory: MessageSenderFactory) {
    const messageSender = senderFactory.createMessageSender(this);
    this.messageHandlers =
      MessageHandlerFactory.createMessageHandler(messageSender);
  }

  sendMessage(message: ChatMessage) {
    const { content, role } = message;
    if (!Array.isArray(content)) {
      // default handler is text handler
      // string content will be handled by text handler
      this.messageHandlers[0]?.handleMessage(content);
    } else {
      for (const item of content) {
        this.processMessage(item);
      }
    }
  }

  private processMessage(message: MessageContentDetail) {
    const messageHandler = this.messageHandlers.find((messageHandler) =>
      messageHandler.canHandleMessage(message),
    );
    if (messageHandler) {
      messageHandler.handleMessage(message);
    }
  }

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
