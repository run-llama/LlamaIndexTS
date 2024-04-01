import type { Anthropic } from "@anthropic-ai/sdk";
import { CustomEvent } from "@llamaindex/env";
import type { NodeWithScore } from "../Node.js";

/**
 * This type is used to define the event maps for the Llamaindex package.
 */
export interface LlamaIndexEventMaps {}

declare module "llamaindex" {
  interface LlamaIndexEventMaps {
    /**
     * @deprecated
     */
    retrieve: CustomEvent<RetrievalCallbackResponse>;
    /**
     * @deprecated
     */
    stream: CustomEvent<StreamCallbackResponse>;
  }
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

type EventHandler<Event extends CustomEvent> = (event: Event) => void;

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
            handler(new CustomEvent("stream", { detail: response })),
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
            handler(new CustomEvent("retrieve", { detail: response })),
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
    handlers.forEach((handler) => handler(new CustomEvent(event, { detail })));
  }
}
