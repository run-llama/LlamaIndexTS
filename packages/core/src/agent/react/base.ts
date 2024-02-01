import { CallbackManager } from "../../callbacks/CallbackManager";
import { ChatMessage, LLM } from "../../llm";
import { ObjectRetriever } from "../../objects/base";
import { BaseTool } from "../../types";
import { AgentRunner } from "../runner/base";
import { ReActAgentWorker } from "./worker";

type ReActAgentParams = {
  tools: BaseTool[];
  llm?: LLM;
  memory?: any;
  prefixMessages?: ChatMessage[];
  verbose?: boolean;
  maxInteractions?: number;
  defaultToolChoice?: string;
  callbackManager?: CallbackManager;
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
    verbose,
    maxInteractions = 10,
    defaultToolChoice = "auto",
    callbackManager,
    toolRetriever,
  }: Partial<ReActAgentParams>) {
    const stepEngine = new ReActAgentWorker({
      tools: tools ?? [],
      callbackManager,
      llm,
      maxInteractions,
      toolRetriever,
      verbose,
    });

    super({
      agentWorker: stepEngine,
      memory,
      callbackManager,
      defaultToolChoice,
      chatHistory: prefixMessages,
    });
  }
}
