import type { LLM } from "@llamaindex/core/llms";
import {
  streamConverter,
  streamReducer,
  wrapEventCaller,
} from "@llamaindex/core/utils";
import type { ChatHistory } from "../../ChatHistory.js";
import { getHistory } from "../../ChatHistory.js";
import { EngineResponse } from "../../EngineResponse.js";
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
  chatHistory: ChatHistory;
  llm: LLM;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = getHistory(init?.chatHistory);
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
      ? getHistory(params.chatHistory)
      : this.chatHistory;
    chatHistory.addMessage({ content: message, role: "user" });

    if (stream) {
      const stream = await this.llm.chat({
        messages: await chatHistory.requestMessages(),
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => accumulator + part.delta,
          finished: (accumulator) => {
            chatHistory.addMessage({ content: accumulator, role: "assistant" });
          },
        }),
        EngineResponse.fromChatResponseChunk,
      );
    }

    const response = await this.llm.chat({
      messages: await chatHistory.requestMessages(),
    });
    chatHistory.addMessage(response.message);
    return EngineResponse.fromChatResponse(response);
  }

  reset() {
    this.chatHistory.reset();
  }
}
