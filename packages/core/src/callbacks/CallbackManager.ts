import type { Anthropic } from "@anthropic-ai/sdk";
import { CustomEvent } from "@llamaindex/env";
import type { NodeWithScore } from "../Node.js";
import type { AgentEndEvent, AgentStartEvent } from "../agent/types.js";
import {
  EventCaller,
  getEventCaller,
} from "../internal/context/EventCaller.js";
import type {
  LLMEndEvent,
  LLMStartEvent,
  LLMStreamEvent,
  LLMToolCallEvent,
  LLMToolResultEvent,
  RetrievalEndEvent,
  RetrievalStartEvent,
} from "../llm/types.js";

export class LlamaIndexCustomEvent<T = any> extends CustomEvent<T> {
  reason: EventCaller | null;
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

/**
 * This type is used to define the event maps.
 */
export interface LlamaIndexEventMaps {
  /**
   * @deprecated
   */
  retrieve: CustomEvent<RetrievalCallbackResponse>;
  "retrieve-start": RetrievalStartEvent;
  "retrieve-end": RetrievalEndEvent;
  /**
   * @deprecated
   */
  stream: CustomEvent<StreamCallbackResponse>;
  // llm events
  "llm-start": LLMStartEvent;
  "llm-end": LLMEndEvent;
  "llm-tool-call": LLMToolCallEvent;
  "llm-tool-result": LLMToolResultEvent;
  "llm-stream": LLMStreamEvent;
  // agent events
  "agent-start": AgentStartEvent;
  "agent-end": AgentEndEvent;
}

//#region @deprecated remove in the next major version
//Specify StreamToken per mainstream LLM
export interface DefaultStreamToken {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      content?: string | null;
      role?: "user" | "assistant" | "system" | "function" | "tool";
    };
    finish_reason: string | null;
  }[];
}

//OpenAI stream token schema is the default.
//Note: Anthropic and Replicate also use similar token schemas.
export type OpenAIStreamToken = DefaultStreamToken;
export type AnthropicStreamToken = Anthropic.Completion;
//
//Callback Responses
//
//TODO: Write Embedding Callbacks

//StreamCallbackResponse should let practitioners implement callbacks out of the box...
//When custom streaming LLMs are involved, people are expected to write their own StreamCallbackResponses
export interface StreamCallbackResponse {
  index: number;
  isDone?: boolean;
  token?: DefaultStreamToken;
}

export interface RetrievalCallbackResponse {
  query: string;
  nodes: NodeWithScore[];
}

interface CallbackManagerMethods {
  /**
   * onLLMStream is called when a token is streamed from the LLM. Defining this
   * callback auto sets the stream = True flag on the openAI createChatCompletion request.
   * @deprecated will be removed in the next major version
   */
  onLLMStream: (params: StreamCallbackResponse) => Promise<void> | void;
  /**
   * onRetrieve is called as soon as the retriever finishes fetching relevant nodes.
   * This callback allows you to handle the retrieved nodes even if the synthesizer
   * is still running.
   * @deprecated will be removed in the next major version
   */
  onRetrieve: (params: RetrievalCallbackResponse) => Promise<void> | void;
}
//#endregion

const noop: (...args: any[]) => any = () => void 0;

type EventHandler<Event extends CustomEvent> = (
  event: Event & {
    reason: EventCaller | null;
  },
) => void;

export class CallbackManager implements CallbackManagerMethods {
  /**
   * @deprecated will be removed in the next major version
   */
  get onLLMStream(): CallbackManagerMethods["onLLMStream"] {
    return async (response) => {
      await Promise.all(
        this.#handlers
          .get("stream")!
          .map((handler) =>
            handler(LlamaIndexCustomEvent.fromEvent("stream", response)),
          ),
      );
    };
  }

  /**
   * @deprecated will be removed in the next major version
   */
  get onRetrieve(): CallbackManagerMethods["onRetrieve"] {
    return async (response) => {
      await Promise.all(
        this.#handlers
          .get("retrieve")!
          .map((handler) =>
            handler(LlamaIndexCustomEvent.fromEvent("retrieve", response)),
          ),
      );
    };
  }

  /**
   * @deprecated will be removed in the next major version
   */
  set onLLMStream(_: never) {
    throw new Error("onLLMStream is deprecated. Use on('stream') instead");
  }

  /**
   * @deprecated will be removed in the next major version
   */
  set onRetrieve(_: never) {
    throw new Error("onRetrieve is deprecated. Use `on('retrieve')` instead");
  }

  #handlers = new Map<keyof LlamaIndexEventMaps, EventHandler<CustomEvent>[]>();

  constructor(handlers?: Partial<CallbackManagerMethods>) {
    const onLLMStream = handlers?.onLLMStream ?? noop;
    this.on("stream", (event) => onLLMStream(event.detail));
    const onRetrieve = handlers?.onRetrieve ?? noop;
    this.on("retrieve", (event) => onRetrieve(event.detail));
  }

  on<
    K extends keyof LlamaIndexEventMaps,
    H extends EventHandler<LlamaIndexEventMaps[K]>,
  >(event: K, handler: H) {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, []);
    }
    this.#handlers.get(event)!.push(handler);
    return this;
  }

  off<
    K extends keyof LlamaIndexEventMaps,
    H extends EventHandler<LlamaIndexEventMaps[K]>,
  >(event: K, handler: H) {
    if (!this.#handlers.has(event)) {
      return;
    }
    const handlers = this.#handlers.get(event)!;
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
    return this;
  }

  dispatchEvent<K extends keyof LlamaIndexEventMaps>(
    event: K,
    detail: LlamaIndexEventMaps[K]["detail"],
  ) {
    const handlers = this.#handlers.get(event);
    if (!handlers) {
      return;
    }
    queueMicrotask(() => {
      handlers.forEach((handler) =>
        handler(
          LlamaIndexCustomEvent.fromEvent(event, {
            ...detail,
          }),
        ),
      );
    });
  }
}
