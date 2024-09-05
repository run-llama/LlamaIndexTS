import type { LLM } from "@llamaindex/core/llms";
import { EngineResponse, StreamEngineResponse } from "@llamaindex/core/schema";
import {
  streamConverter,
  wrapEventCaller,
} from "@llamaindex/core/utils";
import type { ChatHistory } from "../../ChatHistory.js";
import { getHistory } from "../../ChatHistory.js";
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
  ): Promise<StreamEngineResponse>;
  chat(params: ChatEngineParamsNonStreaming): Promise<EngineResponse>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<EngineResponse | StreamEngineResponse> {
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
      return StreamEngineResponse.from(
        streamConverter(
          stream,
          r => r.delta
        ),
      )
    }

    const response = await this.llm.chat({
      messages: await chatHistory.requestMessages(),
    });
    chatHistory.addMessage(response.message);
    return EngineResponse.from(response.message.content);
  }

  reset() {
    this.chatHistory.reset();
  }
}
