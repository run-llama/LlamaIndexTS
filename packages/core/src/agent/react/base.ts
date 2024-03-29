import type { ChatMessage, LLM } from "../../llm/index.js";
import type { ObjectRetriever } from "../../objects/base.js";
import type { BaseTool } from "../../types.js";
import { AgentRunner } from "../runner/base.js";
import { ReActAgentWorker } from "./worker.js";

type ReActAgentParams = {
  tools: BaseTool[];
  llm?: LLM;
  memory?: any;
  prefixMessages?: ChatMessage[];
  verbose?: boolean;
  maxInteractions?: number;
  defaultToolChoice?: string;
  toolRetriever?: ObjectRetriever;
};

/**
 * An agent that uses OpenAI's API to generate text.
 *
 * @category OpenAI
 */
export class ReActAgent extends AgentRunner {
  constructor({
    tools,
    llm,
    memory,
    prefixMessages,
    verbose,
    maxInteractions = 10,
    defaultToolChoice = "auto",
    toolRetriever,
  }: Partial<ReActAgentParams>) {
    const stepEngine = new ReActAgentWorker({
      tools: tools ?? [],
      llm,
      maxInteractions,
      toolRetriever,
      verbose,
    });

    super({
      agentWorker: stepEngine,
      memory,
      defaultToolChoice,
      chatHistory: prefixMessages,
    });
  }
}
