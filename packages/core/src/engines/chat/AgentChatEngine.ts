import { Response } from "../../Response.js";
import type { AgentRunner } from "../../agent/base.js";
import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import type { LLM } from "../../llm/index.js";
import {
  extractText,
  streamConverter,
  streamReducer,
} from "../../llm/utils.js";
import type {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
} from "./types.js";

export class AgentChatEngine implements ChatEngine {
  agent: AgentRunner<LLM>;

  constructor(init: { agent: AgentRunner<LLM> }) {
    this.agent = init?.agent;
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    if (params.stream) {
      const stream = await this.agent.chat({
        message: params.message,
        chatHistory: params.chatHistory ?? this.agent.chatHistory,
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => (accumulator += part.response.delta),
          finished: (accumulator) => {
            this.agent.chatHistory.push({
              content: accumulator,
              role: "assistant",
            });
          },
        }),
        (r) => new Response(r.response.delta),
      );
    }

    const { response } = await this.agent.chat({
      message: params.message,
    });
    this.agent.chatHistory.push(response.message);
    return new Response(extractText(response.message.content));
  }

  reset() {
    this.agent.reset();
  }
}
