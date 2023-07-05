import { ChatCompletionResponseMessageRoleEnum } from "openai";
import { NodeWithScore } from "../Node";

/*
  A trace is a wrapper that allows grouping
  related operations. For example, during retrieve and synthesize,
  a parent trace wraps both operations, and each operation has it's own
  trace. In this case, both operations  will share a parentId.
*/
export interface Trace {
  id: string;
  parentId?: string;
}

interface BaseCallbackResponse {
  trace: Trace;
}

export interface StreamToken {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      content?: string;
      role?: ChatCompletionResponseMessageRoleEnum;
    };
    finish_reason: string | null;
  }[];
}

export interface StreamCallbackResponse extends BaseCallbackResponse {
  index: number;
  isDone?: boolean;
  token?: StreamToken;
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
