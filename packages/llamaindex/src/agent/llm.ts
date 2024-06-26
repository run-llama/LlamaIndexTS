import type { LLM } from "../llm/index.js";
import { ObjectRetriever } from "../objects/index.js";
import { Settings } from "../Settings.js";
import type { BaseToolWithCall } from "../types.js";
import { AgentRunner, AgentWorker, type AgentParamsBase } from "./base.js";
import { validateAgentParams } from "./utils.js";

type LLMParamsBase = AgentParamsBase<LLM>;

type LLMParamsWithTools = LLMParamsBase & {
  tools: BaseToolWithCall[];
};

type LLMParamsWithToolRetriever = LLMParamsBase & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type LLMAgentParams = LLMParamsWithTools | LLMParamsWithToolRetriever;

export class LLMAgentWorker extends AgentWorker<LLM> {
  taskHandler = AgentRunner.defaultTaskHandler;
}

export class LLMAgent extends AgentRunner<LLM> {
  constructor(params: LLMAgentParams) {
    validateAgentParams(params);
    const llm = params.llm ?? (Settings.llm ? (Settings.llm as LLM) : null);
    if (!llm)
      throw new Error(
        "llm must be provided for either in params or Settings.llm",
      );
    super({
      llm,
      chatHistory: params.chatHistory ?? [],
      systemPrompt: params.systemPrompt ?? null,
      runner: new LLMAgentWorker(),
      tools:
        "tools" in params
          ? params.tools
          : params.toolRetriever.retrieve.bind(params.toolRetriever),
      verbose: params.verbose ?? false,
    });
  }

  createStore = AgentRunner.defaultCreateStore;
  taskHandler = AgentRunner.defaultTaskHandler;
}
