import {
  AnthropicAgent,
  type AnthropicAgentParams,
} from "@llamaindex/anthropic";
import {
  withContextAwareness,
  type ContextAwareConfig,
} from "./contextAwareMixin.js";

export type AnthropicContextAwareAgentParams = AnthropicAgentParams &
  ContextAwareConfig;

export class AnthropicContextAwareAgent extends withContextAwareness(
  AnthropicAgent,
) {
  constructor(params: AnthropicContextAwareAgentParams) {
    super(params);
  }
}

export * from "@llamaindex/anthropic";
