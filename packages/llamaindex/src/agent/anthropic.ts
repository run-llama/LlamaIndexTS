import type { ChatEngineParams } from "@llamaindex/core/chat-engine";
import type { EngineResponse } from "@llamaindex/core/schema";
import { Settings } from "../Settings.js";
import { Anthropic } from "../llm/anthropic.js";
import { LLMAgent, LLMAgentWorker, type LLMAgentParams } from "./llm.js";

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

  async chat(params: ChatEngineParams, stream?: false): Promise<EngineResponse>;
  async chat(params: ChatEngineParams, stream: true): Promise<never>;
  override async chat(params: ChatEngineParams, stream?: boolean) {
    if (stream) {
      // Anthropic does support this, but looks like it's not supported in the LITS LLM
      throw new Error("Anthropic does not support streaming");
    }
    return super.chat(params);
  }
}
