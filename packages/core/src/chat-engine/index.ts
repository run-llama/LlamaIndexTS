import type { ChatMessage, MessageContent } from "../../dist/llms";
import type { BaseMemory } from "../../dist/memory";
import { EngineResponse } from "../../dist/schema";

export interface ChatEngineParams<
  AdditionalMessageOptions extends object = object,
> {
  message: MessageContent;
  /**
   * Optional chat history if you want to customize the chat history.
   */
  chatHistory?:
    | ChatMessage<AdditionalMessageOptions>[]
    | BaseMemory<AdditionalMessageOptions>;
}

export abstract class BaseChatEngine {
  abstract chat(
    params: ChatEngineParams,
    stream?: false,
  ): Promise<EngineResponse>;
  abstract chat(
    params: ChatEngineParams,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;

  abstract chatHistory: ChatMessage[];
}
