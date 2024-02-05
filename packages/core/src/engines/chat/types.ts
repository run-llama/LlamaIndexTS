import { ChatHistory } from "../../ChatHistory";
import { BaseNode, NodeWithScore } from "../../Node";
import { Response } from "../../Response";
import { Event } from "../../callbacks/CallbackManager";
import { ChatMessage } from "../../llm";
import { MessageContent } from "../../llm/types";
import { ToolOutput } from "../../tools/types";

/**
 * Represents the base parameters for ChatEngine.
 */
export interface ChatEngineParamsBase {
  message: MessageContent;
  /**
   * Optional chat history if you want to customize the chat history.
   */
  chatHistory?: ChatMessage[] | ChatHistory;
}

export interface ChatEngineParamsStreaming extends ChatEngineParamsBase {
  stream: true;
}

export interface ChatEngineParamsNonStreaming extends ChatEngineParamsBase {
  stream?: false | null;
}

export interface ChatEngineAgentParams extends ChatEngineParamsBase {
  toolChoice?: string | Record<string, any>;
}

/**
 * A ChatEngine is used to handle back and forth chats between the application and the LLM.
 */
export interface ChatEngine {
  /**
   * Send message along with the class's current chat history to the LLM.
   * @param params
   */
  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;

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
  generate(message: string, parentEvent?: Event): Promise<Context>;
}

export enum ChatResponseMode {
  WAIT = "wait",
  STREAM = "stream",
}

export class AgentChatResponse {
  response: string;
  sources: ToolOutput[];
  sourceNodes?: BaseNode[];

  constructor(
    response: string,
    sources?: ToolOutput[],
    sourceNodes?: BaseNode[],
  ) {
    this.response = response;
    this.sources = sources || [];
    this.sourceNodes = sourceNodes || [];
  }

  protected _getFormattedSources() {
    throw new Error("Not implemented yet");
  }

  toString() {
    return this.response ?? "";
  }
}
