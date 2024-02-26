import type { ChatHistory } from "../../ChatHistory.js";
import { getHistory } from "../../ChatHistory.js";
import { Response } from "../../Response.js";
import type { ChatResponseChunk, LLM } from "../../llm/index.js";
import { OpenAI } from "../../llm/index.js";
import { streamConverter, streamReducer } from "../../llm/utils.js";
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
    this.llm = init?.llm ?? new OpenAI();
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
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
          reducer: (accumulator, part) => (accumulator += part.delta),
          finished: (accumulator) => {
            chatHistory.addMessage({ content: accumulator, role: "assistant" });
          },
        }),
        (r: ChatResponseChunk) => new Response(r.delta),
      );
    }

    const response = await this.llm.chat({
      messages: await chatHistory.requestMessages(),
    });
    chatHistory.addMessage(response.message);
    return new Response(response.message.content);
  }

  reset() {
    this.chatHistory.reset();
  }
}
