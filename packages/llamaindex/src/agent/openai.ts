import { OpenAIAgent } from "@llamaindex/openai";
import { withContextAwareness } from "./contextAwareMixin.js";

export const OpenAIContextAwareAgent = withContextAwareness(OpenAIAgent);
export type { ContextAwareConfig } from "./contextAwareMixin.js";

export * from "@llamaindex/openai";
