import { AsyncLocalStorage, CustomEvent } from "@llamaindex/env";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  ToolCall,
  ToolOutput,
} from "../../llms";
import type { UUID } from "../type";

export type BaseEvent<Payload extends Record<string, unknown>> = CustomEvent<{
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
  private constructor(event: string, options?: CustomEventInit) {
    super(event, options);
  }

  static fromEvent<Type extends keyof LlamaIndexEventMaps>(
    type: Type,
    detail: LlamaIndexEventMaps[Type]["detail"],
  ) {
    return new LlamaIndexCustomEvent(type, {
      detail: detail,
    });
  }
}

export interface CallbackManager {
  on<
    K extends keyof LlamaIndexEventMaps,
    H extends EventHandler<LlamaIndexEventMaps[K]>,
  >(
    event: K,
    handler: H,
  ): this;

  off<
    K extends keyof LlamaIndexEventMaps,
    H extends EventHandler<LlamaIndexEventMaps[K]>,
  >(
    event: K,
    handler: H,
  ): this;

  dispatchEvent<K extends keyof LlamaIndexEventMaps>(
    event: K,
    detail: LlamaIndexEventMaps[K]["detail"],
  ): void;
}

type EventHandler<Event extends CustomEvent> = (event: Event) => void;

const createCallbackManager = (): CallbackManager => {
  const handlers = new Map<
    keyof LlamaIndexEventMaps,
    EventHandler<CustomEvent>[]
  >();
  return {
    on<
      K extends keyof LlamaIndexEventMaps,
      H extends EventHandler<LlamaIndexEventMaps[K]>,
    >(event: K, handler: H) {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event)!.push(handler);
      return this;
    },

    off<
      K extends keyof LlamaIndexEventMaps,
      H extends EventHandler<LlamaIndexEventMaps[K]>,
    >(event: K, handler: H) {
      if (!handlers.has(event)) {
        return this;
      }
      const cbs = handlers.get(event)!;
      const index = cbs.indexOf(handler);
      if (index > -1) {
        cbs.splice(index, 1);
      }
      return this;
    },

    dispatchEvent<K extends keyof LlamaIndexEventMaps>(
      event: K,
      detail: LlamaIndexEventMaps[K]["detail"],
    ) {
      const cbs = handlers.get(event);
      if (!cbs) {
        return;
      }
      queueMicrotask(() => {
        cbs.forEach((handler) =>
          handler(
            LlamaIndexCustomEvent.fromEvent(event, {
              ...detail,
            }),
          ),
        );
      });
    },
  };
};

export const globalCallbackManager = createCallbackManager();

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
