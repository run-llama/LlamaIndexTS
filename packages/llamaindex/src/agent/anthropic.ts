import { AnthropicAgent } from "@llamaindex/anthropic";
import { withContextAwareness } from "./contextAwareMixin.js";

export const AnthropicContextAwareAgent = withContextAwareness(AnthropicAgent);
export type { ContextAwareConfig } from "./contextAwareMixin.js";

export * from "@llamaindex/anthropic";
