import {
  LLMAgent,
  LLMAgentWorker,
  type LLMAgentParams,
} from "@llamaindex/core/agent";
import type {
  NonStreamingChatEngineParams,
  StreamingChatEngineParams,
} from "@llamaindex/core/chat-engine";
import { Settings } from "@llamaindex/core/global";
import type { EngineResponse } from "@llamaindex/core/schema";
import { Anthropic } from "./llm.js";

export type AnthropicAgentParams = LLMAgentParams;

export class AnthropicAgentWorker extends LLMAgentWorker {}

export class AnthropicAgent extends LLMAgent {
  constructor(params: AnthropicAgentParams) {
    const llm =
      params.llm ??
      (Settings.llm instanceof Anthropic
        ? (Settings.llm as Anthropic)
        : new Anthropic());
    super({
      ...params,
      llm,
    });
  }

  async chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
  async chat(params: StreamingChatEngineParams): Promise<never>;
  override async chat(
    params: NonStreamingChatEngineParams | StreamingChatEngineParams,
  ) {
    const { stream } = params;
    if (stream) {
      // Anthropic does support this, but looks like it's not supported in the LITS LLM
      throw new Error("Anthropic does not support streaming");
    }
    return super.chat(params);
  }
}
