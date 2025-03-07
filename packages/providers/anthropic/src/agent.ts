import {
  LLMAgent,
  LLMAgentWorker,
  type LLMAgentParams,
} from "@llamaindex/core/agent";
import { Settings } from "@llamaindex/core/global";
import { Anthropic } from "./llm.js";

export type AnthropicAgentParams = LLMAgentParams<Anthropic>;

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
}
