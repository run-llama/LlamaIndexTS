import type { ChatMessage, MessageContent } from "../llms";
import type { BaseMemory } from "../memory";
import { EngineResponse } from "../schema";

export interface BaseChatEngineParams<
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

export interface StreamingChatEngineParams<
  AdditionalMessageOptions extends object = object,
  AdditionalChatOptions extends object = object,
> extends BaseChatEngineParams<AdditionalMessageOptions> {
  stream: true;
  chatOptions?: AdditionalChatOptions;
}

export interface NonStreamingChatEngineParams<
  AdditionalMessageOptions extends object = object,
  AdditionalChatOptions extends object = object,
> extends BaseChatEngineParams<AdditionalMessageOptions> {
  stream?: false;
  chatOptions?: AdditionalChatOptions;
}

export abstract class BaseChatEngine {
  abstract chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
  abstract chat(
    params: StreamingChatEngineParams,
  ): Promise<AsyncIterable<EngineResponse>>;

  abstract chatHistory: ChatMessage[] | Promise<ChatMessage[]>;
}
