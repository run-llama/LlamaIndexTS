// src/callbacks/CallbackManager.ts

type StreamCallback = { event: Event, index: number, isDone: boolean, token: string };

export class CallbackManager {
  private callbacks: ((callback: StreamCallback) => void)[] = [];

  onLLMStream(callback: (callback: StreamCallback) => void): void {
    this.callbacks.push(callback);
  }

  triggerLLMStream(event: Event, index: number, isDone: boolean, token: string): void {
    const streamCallback: StreamCallback = { event, index, isDone, token };
    this.callbacks.forEach(callback => callback(streamCallback));
  }
}
