import type { LLM } from "@llamaindex/core/llms";
import { BaseMemory, ChatMemoryBuffer } from "@llamaindex/core/memory";
import { EngineResponse } from "@llamaindex/core/schema";
import {
  streamConverter,
  streamReducer,
  wrapEventCaller,
} from "@llamaindex/core/utils";
import { Settings } from "../../Settings.js";
import type {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
} from "./types.js";

/**
 * SimpleChatEngine is the simplest possible chat engine. Useful for using your own custom prompts.
 */

export class SimpleChatEngine implements ChatEngine {
  chatHistory: BaseMemory;
  llm: LLM;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = init?.chatHistory ?? new ChatMemoryBuffer();
    this.llm = init?.llm ?? Settings.llm;
  }

  chat(
    params: ChatEngineParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<EngineResponse>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { message, stream } = params;

    const chatHistory = params.chatHistory
      ? new ChatMemoryBuffer({
          chatHistory:
            params.chatHistory instanceof BaseMemory
              ? await params.chatHistory.getMessages()
              : params.chatHistory,
        })
      : this.chatHistory;
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
    this.chatHistory.reset();
  }
}
