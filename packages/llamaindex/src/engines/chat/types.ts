import type { ChatMessage } from "@llamaindex/core/llms";
import type { NodeWithScore } from "@llamaindex/core/schema";

export interface Context {
  message: ChatMessage;
  nodes: NodeWithScore[];
}
/**
 * A ContextGenerator is used to generate a context based on a message's text content
 */
export interface ContextGenerator {
  generate(message: string): Promise<Context>;
}
