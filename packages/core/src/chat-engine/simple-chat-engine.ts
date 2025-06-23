import type { LLM } from "../llms";
import { Memory } from "../memory";
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
  memory: Memory;
  llm: LLM;

  get chatHistory() {
    return this.memory.getLLM();
  }

  constructor(init?: Partial<SimpleChatEngine>) {
    this.llm = init?.llm ?? Settings.llm;
    this.memory = init?.memory ?? new Memory();
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
      ? params.chatHistory instanceof Memory
        ? params.chatHistory
        : Memory.fromChatMessages(params.chatHistory)
      : this.memory;
    await chatHistory.add({ content: message, role: "user" });

    if (stream) {
      const stream = await this.llm.chat({
        messages: await chatHistory.getLLM(this.llm),
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => accumulator + part.delta,
          finished: (accumulator) => {
            void chatHistory.add({ content: accumulator, role: "assistant" });
          },
        }),
        EngineResponse.fromChatResponseChunk,
      );
    }

    const response = await this.llm.chat({
      stream: false,
      messages: await chatHistory.getLLM(this.llm),
    });
    await chatHistory.add(response.message);
    return EngineResponse.fromChatResponse(response);
  }

  async reset() {
    await this.memory.clear();
  }
}
