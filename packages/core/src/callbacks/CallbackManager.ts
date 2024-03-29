import type { Anthropic } from "@anthropic-ai/sdk";
import { AsyncLocalStorage } from "@llamaindex/env";
import type { NodeWithScore } from "../Node.js";

export type Timeline = "start" | "end";

// do not remove this type
export interface LlamaIndexEventMaps {}

//#region @deprecated remove in the next major version
/*
  An event is a wrapper that groups related operations.
  For example, during retrieve and synthesize,
  a parent event wraps both operations, and each operation has it's own
  event. In this case, both sub-events will share a parentId.
*/

export type EventTag = "intermediate" | "final";
export type EventType = "retrieve" | "llmPredict" | "wrapper";
export interface Event {
  id: string;
  type: EventType;
  tags?: EventTag[];
  parentId?: string;
}

interface BaseCallbackResponse {
  event: Event;
}

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
export interface StreamCallbackResponse extends BaseCallbackResponse {
  index: number;
  isDone?: boolean;
  token?: DefaultStreamToken;
}

export interface RetrievalCallbackResponse extends BaseCallbackResponse {
  query: string;
  nodes: NodeWithScore[];
}

interface CallbackManagerMethods {
  /**
   * onLLMStream is called when a token is streamed from the LLM. Defining this
   * callback auto sets the stream = True flag on the openAI createChatCompletion request.
   * @deprecated will be removed in the next major version
   */
  onLLMStream?: (params: StreamCallbackResponse) => Promise<void> | void;
  /**
   * onRetrieve is called as soon as the retriever finishes fetching relevant nodes.
   * This callback allows you to handle the retrieved nodes even if the synthesizer
   * is still running.
   * @deprecated will be removed in the next major version
   */
  onRetrieve?: (params: RetrievalCallbackResponse) => Promise<void> | void;
}
//#endregion

const noop: (...args: any[]) => any = () => void 0;

/**
 * @internal
 */
type EventHandler<Event extends CustomEvent> = (event: Event) => void;

export class CallbackManager implements CallbackManagerMethods {
  /**
   * @deprecated
   */
  onLLMStream: (params: StreamCallbackResponse) => Promise<void>;
  /**
   * @deprecated
   */
  onRetrieve: (params: RetrievalCallbackResponse) => Promise<void>;

  #handlers = new Map<string, EventHandler<CustomEvent>[]>();

  constructor(handlers?: CallbackManagerMethods) {
    this.onLLMStream = handlers?.onLLMStream ?? noop;
    this.onRetrieve = handlers?.onRetrieve ?? noop;
  }

  addHandlers<K extends keyof LlamaIndexEventMaps>(
    event: K,
    handler: EventHandler<LlamaIndexEventMaps[K]>,
  ) {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, []);
    }
    this.#handlers.get(event)!.push(
      // @ts-expect-error
      handler,
    );
  }

  removeHandlers<K extends keyof LlamaIndexEventMaps>(
    event: K,
    handler: EventHandler<LlamaIndexEventMaps[K]>,
  ) {
    if (!this.#handlers.has(event)) {
      return;
    }
    const handlers = this.#handlers.get(event)!;
    const index = handlers.indexOf(
      // @ts-expect-error
      handler,
    );
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}

const defaultCallbackManager = new CallbackManager();
const callbackAsyncLocalStorage = new AsyncLocalStorage<CallbackManager>();

/**
 * Get the current callback manager
 * @default defaultCallbackManager if no callback manager is set
 * @internal
 *  only call this function in the internal code,
 *    do not expose it to the public API
 */
export function getCurrentCallbackManager() {
  return callbackAsyncLocalStorage.getStore() ?? defaultCallbackManager;
}

export function runWithCallbackManager<Result>(
  callbackManager: CallbackManager,
  fn: () => Result,
): Result {
  return callbackAsyncLocalStorage.run(callbackManager, fn);
}
