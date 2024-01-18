import { ChatHistory } from "../../ChatHistory";
import { NodeWithScore } from "../../Node";
import { Response } from "../../Response";
import { Event } from "../../callbacks/CallbackManager";
import { ChatMessage } from "../../llm";

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

export interface MessageContentDetail {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

/**
 * Extended type for the content of a message that allows for multi-modal messages.
 */
export type MessageContent = string | MessageContentDetail[];

/**
 * Extracts just the text from a multi-modal message or the message itself if it's just text.
 *
 * @param message The message to extract text from.
 * @returns The extracted text
 */
export function extractText(message: MessageContent): string {
  if (Array.isArray(message)) {
    // message is of type MessageContentDetail[] - retrieve just the text parts and concatenate them
    // so we can pass them to the context generator
    return (message as MessageContentDetail[])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n\n");
  }
  return message;
}
