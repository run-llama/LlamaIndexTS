import { Settings } from "../global";
import type { BaseToolWithCall, LLM } from "../llms";
import { ObjectRetriever } from "../objects";
import { AgentRunner, AgentWorker, type AgentParamsBase } from "./base.js";
import { validateAgentParams } from "./utils.js";

type LLMParamsBase<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = AgentParamsBase<AI, AdditionalMessageOptions, AdditionalChatOptions>;

type LLMParamsWithTools<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = LLMParamsBase<AI, AdditionalMessageOptions, AdditionalChatOptions> & {
  tools: BaseToolWithCall[];
};

type LLMParamsWithToolRetriever<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = LLMParamsBase<AI, AdditionalMessageOptions, AdditionalChatOptions> & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type LLMAgentParams<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> =
  | LLMParamsWithTools<AI, AdditionalMessageOptions, AdditionalChatOptions>
  | LLMParamsWithToolRetriever<
      AI,
      AdditionalMessageOptions,
      AdditionalChatOptions
    >;

export class LLMAgentWorker extends AgentWorker<LLM> {
  taskHandler = AgentRunner.defaultTaskHandler;
}

/**
 * @deprecated Use agent instead.
 */
export class LLMAgent extends AgentRunner<LLM> {
  constructor(params: LLMAgentParams<LLM>) {
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
