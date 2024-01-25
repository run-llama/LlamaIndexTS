import { BaseTool } from "../../Tool";
import { CallbackManager } from "../../callbacks/CallbackManager";
import { ChatMessage, OpenAI } from "../../llm";
import { ObjectRetriever } from "../../objects/base";
import { AgentRunner } from "../runner/base";
import { OpenAIAgentWorker } from "./worker";

type OpenAIAgentParams = {
  tools: BaseTool[];
  llm?: OpenAI;
  memory?: any;
  prefixMessages?: ChatMessage[];
  verbose?: boolean;
  maxFunctionCalls?: number;
  defaultToolChoice?: string;
  callbackManager?: CallbackManager;
  toolRetriever?: ObjectRetriever<BaseTool>;
};

export class OpenAIAgent extends AgentRunner {
  constructor({
    tools,
    llm,
    memory,
    prefixMessages,
    verbose,
    maxFunctionCalls = 5,
    defaultToolChoice = "auto",
    callbackManager,
    toolRetriever,
  }: OpenAIAgentParams) {
    const stepEngine = new OpenAIAgentWorker({
      tools,
      callbackManager,
      llm,
      prefixMessages,
      maxFunctionCalls,
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
