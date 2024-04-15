import type { ChatMessage, LLM } from "../../llm/index.js";
import type { BaseMemory } from "../../memory/types.js";
import type { ObjectRetriever } from "../../objects/base.js";
import type { BaseTool } from "../../types.js";
import { AgentRunner } from "../runner/base.js";
import { ReActAgentWorker } from "./worker.js";

type ReActAgentParams = {
  tools: BaseTool[];
  llm?: LLM;
  memory?: BaseMemory;
  prefixMessages?: ChatMessage[];
  maxInteractions?: number;
  defaultToolChoice?: string;
  toolRetriever?: ObjectRetriever<BaseTool>;
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
    maxInteractions = 10,
    defaultToolChoice = "auto",
    toolRetriever,
  }: Partial<ReActAgentParams>) {
    const stepEngine = new ReActAgentWorker({
      tools: tools ?? [],
      llm,
      maxInteractions,
      toolRetriever,
    });

    super({
      agentWorker: stepEngine,
      memory,
      defaultToolChoice,
      // @ts-expect-error 2322
      chatHistory: prefixMessages,
    });
  }
}
