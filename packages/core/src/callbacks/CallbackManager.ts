import { NodeWithScore } from "../Node";

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
      role?: "user" | "assistant" | "system" | "function";
    };
    finish_reason: string | null;
  }[];
}

//OpenAI stream token schema is the default.
//Note: Anthropic and Replicate also use similar token schemas.
export type OpenAIStreamToken = DefaultStreamToken;
export type AnthropicStreamToken = 
{
  completion: string,
  stop_reason: string | undefined,
  model: string,
  stop: boolean | undefined,
  log_id: string
};

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
  /*
    onLLMStream is called when a token is streamed from the LLM. Defining this
    callback auto sets the stream = True flag on the openAI createChatCompletion request.
  */
  onLLMStream?: (params: StreamCallbackResponse) => Promise<void> | void;
  /*
    onRetrieve is called as soon as the retriever finishes fetching relevant nodes.
    This callback allows you to handle the retrieved nodes even if the synthesizer
    is still running.
  */
  onRetrieve?: (params: RetrievalCallbackResponse) => Promise<void> | void;
}

export class CallbackManager implements CallbackManagerMethods {
  onLLMStream?: (params: StreamCallbackResponse) => Promise<void> | void;
  onRetrieve?: (params: RetrievalCallbackResponse) => Promise<void> | void;

  constructor(handlers?: CallbackManagerMethods) {
    this.onLLMStream = handlers?.onLLMStream;
    this.onRetrieve = handlers?.onRetrieve;
  }
}
