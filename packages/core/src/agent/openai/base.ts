import { CallbackManager } from "../../callbacks/CallbackManager";
import { ChatMessage, OpenAI } from "../../llm";
import { ObjectRetriever } from "../../objects/base";
import { BaseTool } from "../../types";
import { AgentRunner } from "../runner/base";
import { OpenAIAgentWorker } from "./worker";

type OpenAIAgentParams = {
  tools?: BaseTool[];
  llm?: OpenAI;
  memory?: any;
  prefixMessages?: ChatMessage[];
  verbose?: boolean;
  maxFunctionCalls?: number;
  defaultToolChoice?: string;
  callbackManager?: CallbackManager;
  toolRetriever?: ObjectRetriever;
  systemPrompt?: string;
};

/**
 * An agent that uses OpenAI's API to generate text.
 *
 * @category OpenAI
 */
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
    systemPrompt,
  }: OpenAIAgentParams) {
    prefixMessages = prefixMessages || [];

    llm = llm ?? new OpenAI({ model: "gpt-3.5-turbo-0613" });

    if (systemPrompt) {
      if (prefixMessages) {
        throw new Error("Cannot provide both systemPrompt and prefixMessages");
      }

      prefixMessages = [
        {
          content: systemPrompt,
          role: "system",
        },
      ];
    }

    if (!llm?.metadata.isFunctionCallingModel) {
      throw new Error("LLM model must be a function-calling model");
    }

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
