import { Settings } from "../../Settings.js";
import type { ChatMessage } from "../../llm/index.js";
import { OpenAI } from "../../llm/index.js";
import type { BaseMemory } from "../../memory/types.js";
import type { ObjectRetriever } from "../../objects/base.js";
import type { BaseTool } from "../../types.js";
import { AgentRunner } from "../runner/base.js";
import { OpenAIAgentWorker } from "./worker.js";

type OpenAIAgentParams = {
  tools?: BaseTool[];
  llm?: OpenAI;
  memory?: BaseMemory;
  prefixMessages?: ChatMessage[];
  maxFunctionCalls?: number;
  defaultToolChoice?: string;
  toolRetriever?: ObjectRetriever<BaseTool>;
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
    maxFunctionCalls = 5,
    defaultToolChoice = "auto",
    toolRetriever,
    systemPrompt,
  }: OpenAIAgentParams) {
    if (!llm) {
      if (Settings.llm instanceof OpenAI) {
        llm = Settings.llm;
      } else {
        console.warn("No OpenAI model provided, creating a new one");
        llm = new OpenAI({ model: "gpt-3.5-turbo-0613" });
      }
    }

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

    if (!llm?.supportToolCall) {
      throw new Error("LLM model must be a function-calling model");
    }

    const stepEngine = new OpenAIAgentWorker({
      tools,
      llm,
      prefixMessages,
      maxFunctionCalls,
      toolRetriever,
    });

    super({
      agentWorker: stepEngine,
      llm,
      memory,
      defaultToolChoice,
      // @ts-expect-error 2322
      chatHistory: prefixMessages,
    });
  }
}
