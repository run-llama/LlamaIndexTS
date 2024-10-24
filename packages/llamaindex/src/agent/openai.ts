import { OpenAIAgent, type OpenAIAgentParams } from "@llamaindex/openai";
import {
  withContextAwareness,
  type ContextAwareConfig,
} from "./contextAwareMixin.js";

export type OpenAIContextAwareAgentParams = OpenAIAgentParams &
  ContextAwareConfig;

export class OpenAIContextAwareAgent extends withContextAwareness(OpenAIAgent) {
  constructor(params: OpenAIContextAwareAgentParams) {
    super(params);
  }
}

export * from "@llamaindex/openai";
