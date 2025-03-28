import type { LLM } from "../llms";
import { BaseMemory, ChatMemoryBuffer } from "../memory";
import { EngineResponse } from "../schema";
import { streamConverter, streamReducer } from "../utils";
import type {
  BaseChatEngine,
  NonStreamingChatEngineParams,
  StreamingChatEngineParams,
} from "./base";

import { wrapEventCaller } from "../decorator";
import { Settings } from "../global";

/**
 * SimpleChatEngine is the simplest possible chat engine. Useful for using your own custom prompts.
 */

export class SimpleChatEngine implements BaseChatEngine {
  memory: BaseMemory;
  llm: LLM;

  get chatHistory() {
    return this.memory.getMessages();
  }

  constructor(init?: Partial<SimpleChatEngine>) {
    this.llm = init?.llm ?? Settings.llm;
    this.memory =
      init?.memory ??
      new ChatMemoryBuffer({
        llm: this.llm,
      });
  }

  chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
  chat(
    params: StreamingChatEngineParams,
  ): Promise<AsyncIterable<EngineResponse>>;
  @wrapEventCaller
  async chat(
    params: NonStreamingChatEngineParams | StreamingChatEngineParams,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { message, stream } = params;

    const chatHistory = params.chatHistory
      ? new ChatMemoryBuffer({
          llm: this.llm,
          chatHistory:
            params.chatHistory instanceof BaseMemory
              ? await params.chatHistory.getMessages()
              : params.chatHistory,
        })
      : this.memory;
    chatHistory.put({ content: message, role: "user" });

    if (stream) {
      const stream = await this.llm.chat({
        messages: await chatHistory.getMessages(),
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => accumulator + part.delta,
          finished: (accumulator) => {
            chatHistory.put({ content: accumulator, role: "assistant" });
          },
        }),
        EngineResponse.fromChatResponseChunk,
      );
    }

    const response = await this.llm.chat({
      stream: false,
      messages: await chatHistory.getMessages(),
    });
    chatHistory.put(response.message);
    return EngineResponse.fromChatResponse(response);
  }

  reset() {
    this.memory.reset();
  }
}
