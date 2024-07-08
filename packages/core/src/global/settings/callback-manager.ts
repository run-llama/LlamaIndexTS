import { AsyncLocalStorage, CustomEvent } from "@llamaindex/env";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  ToolCall,
  ToolOutput,
} from "../../llms";
import { EventCaller, getEventCaller } from "../../utils/event-caller";
import type { UUID } from "../type";

export type BaseEvent<Payload> = CustomEvent<{
  payload: Readonly<Payload>;
}>;

export type LLMStartEvent = BaseEvent<{
  id: UUID;
  messages: ChatMessage[];
}>;
export type LLMToolCallEvent = BaseEvent<{
  toolCall: ToolCall;
}>;
export type LLMToolResultEvent = BaseEvent<{
  toolCall: ToolCall;
  toolResult: ToolOutput;
}>;
export type LLMEndEvent = BaseEvent<{
  id: UUID;
  response: ChatResponse;
}>;
export type LLMStreamEvent = BaseEvent<{
  id: UUID;
  chunk: ChatResponseChunk;
}>;

export interface LlamaIndexEventMaps {
  "llm-start": LLMStartEvent;
  "llm-end": LLMEndEvent;
  "llm-tool-call": LLMToolCallEvent;
  "llm-tool-result": LLMToolResultEvent;
  "llm-stream": LLMStreamEvent;
}

export class LlamaIndexCustomEvent<T = any> extends CustomEvent<T> {
  reason: EventCaller | null = null;
  private constructor(
    event: string,
    options?: CustomEventInit & {
      reason?: EventCaller | null;
    },
  ) {
    super(event, options);
    this.reason = options?.reason ?? null;
  }

  static fromEvent<Type extends keyof LlamaIndexEventMaps>(
    type: Type,
    detail: LlamaIndexEventMaps[Type]["detail"],
  ) {
    return new LlamaIndexCustomEvent(type, {
      detail: detail,
      reason: getEventCaller(),
    });
  }
}

type EventHandler<Event> = (event: Event) => void;

export class CallbackManager {
  #handlers = new Map<keyof LlamaIndexEventMaps, EventHandler<CustomEvent>[]>();

  on<K extends keyof LlamaIndexEventMaps>(
    event: K,
    handler: EventHandler<LlamaIndexEventMaps[K]>,
  ) {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, []);
    }
    this.#handlers.get(event)!.push(handler);
    return this;
  }

  off<K extends keyof LlamaIndexEventMaps>(
    event: K,
    handler: EventHandler<LlamaIndexEventMaps[K]>,
  ) {
    if (!this.#handlers.has(event)) {
      return this;
    }
    const cbs = this.#handlers.get(event)!;
    const index = cbs.indexOf(handler);
    if (index > -1) {
      cbs.splice(index, 1);
    }
    return this;
  }

  dispatchEvent<K extends keyof LlamaIndexEventMaps>(
    event: K,
    detail: LlamaIndexEventMaps[K]["detail"],
  ) {
    const cbs = this.#handlers.get(event);
    if (!cbs) {
      return;
    }
    queueMicrotask(() => {
      cbs.forEach((handler) =>
        handler(
          LlamaIndexCustomEvent.fromEvent(event, structuredClone(detail)),
        ),
      );
    });
  }
}

export const globalCallbackManager = new CallbackManager();

const callbackManagerAsyncLocalStorage =
  new AsyncLocalStorage<CallbackManager>();

let currentCallbackManager: CallbackManager | null = null;

export function getCallbackManager(): CallbackManager {
  return (
    callbackManagerAsyncLocalStorage.getStore() ??
    currentCallbackManager ??
    globalCallbackManager
  );
}

export function setCallbackManager(callbackManager: CallbackManager) {
  currentCallbackManager = callbackManager;
}

export function withCallbackManager<Result>(
  callbackManager: CallbackManager,
  fn: () => Result,
): Result {
  return callbackManagerAsyncLocalStorage.run(callbackManager, fn);
}
