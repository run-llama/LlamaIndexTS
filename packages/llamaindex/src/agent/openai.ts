import { OpenAI } from "@llamaindex/openai";
import { Settings } from "../Settings.js";
import {
  withContextAwareness,
  type ContextAwareConfig,
} from "./contextAwareMixin.js";
import { LLMAgent, LLMAgentWorker, type LLMAgentParams } from "./llm.js";

// This is likely not necessary anymore but leaving it here just incase it's in use elsewhere

export type OpenAIAgentParams = LLMAgentParams;

export class OpenAIAgentWorker extends LLMAgentWorker {}

export class OpenAIAgent extends LLMAgent {
  constructor(params: OpenAIAgentParams) {
    const llm =
      params.llm ??
      (Settings.llm instanceof OpenAI
        ? (Settings.llm as OpenAI)
        : new OpenAI());
    super({
      ...params,
      llm,
    });
  }
}

export class OpenAIContextAwareAgent extends (withContextAwareness(
  OpenAIAgent,
) as new (params: OpenAIAgentParams & ContextAwareConfig) => OpenAIAgent) {
  constructor(params: OpenAIAgentParams & ContextAwareConfig) {
    super(params);
  }
}
