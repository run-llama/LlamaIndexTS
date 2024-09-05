import type { ChatMessage, MessageContent } from "@llamaindex/core/llms";
import {
  EngineResponse,
  type NodeWithScore,
  StreamEngineResponse
} from '@llamaindex/core/schema';
import type { ChatHistory } from "../../ChatHistory.js";

/**
 * Represents the base parameters for ChatEngine.
 */
export interface ChatEngineParamsBase {
  message: MessageContent;
  /**
   * Optional chat history if you want to customize the chat history.
   */
  chatHistory?: ChatMessage[] | ChatHistory;
  /**
   * Optional flag to enable verbose mode.
   * @default false
   */
  verbose?: boolean;
}

export interface ChatEngineParamsStreaming extends ChatEngineParamsBase {
  stream: true;
}

export interface ChatEngineParamsNonStreaming extends ChatEngineParamsBase {
  stream?: false | null;
}

/**
 * A ChatEngine is used to handle back and forth chats between the application and the LLM.
 */
export interface ChatEngine<
  // synchronous response
  R = EngineResponse,
  // asynchronous response
  AR = StreamEngineResponse,
> {
  /**
   * Send message along with the class's current chat history to the LLM.
   * @param params
   */
  chat(params: ChatEngineParamsStreaming): Promise<AR>;
  chat(params: ChatEngineParamsNonStreaming): Promise<R>;

  /**
   * Resets the chat history so that it's empty.
   */
  reset(): void;
}

export interface Context {
  message: ChatMessage;
  nodes: NodeWithScore[];
}

/**
 * A ContextGenerator is used to generate a context based on a message's text content
 */
export interface ContextGenerator {
  generate(message: string): Promise<Context>;
}
