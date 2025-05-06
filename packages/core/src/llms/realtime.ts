import type { ChatMessage, LiveConfig, LiveEvent } from "./type";

export abstract class RealIimeLLM<TMessage = ChatMessage> {
  protected eventQueue: LiveEvent[] = [];
  protected eventResolvers: ((value: LiveEvent) => void)[] = [];
  protected closed = false;

  abstract connect(config?: LiveConfig): Promise<this>;
  abstract disconnect(): Promise<void>;
  abstract sendMessage(message: TMessage): void;

  async *streamEvents(): AsyncIterable<LiveEvent> {
    while (true) {
      const event = await this.nextEvent();
      if (event === undefined) {
        break;
      }
      yield event;
    }
  }

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
  protected pushEventToQueue(event: LiveEvent) {
    if (this.eventResolvers.length) {
      //resolving the promise with the event
      this.eventResolvers.shift()!(event);
    } else {
      this.eventQueue.push(event);
    }
  }
}
