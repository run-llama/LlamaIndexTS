import {
  Settings,
  type BaseToolWithCall,
  type LLM,
  type ObjectRetriever,
} from "../index.edge.js";
import { AgentRunner, AgentWorker, type AgentParamsBase } from "./base.js";

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
