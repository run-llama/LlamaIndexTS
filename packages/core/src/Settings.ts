import { CallbackManager } from "./callbacks/CallbackManager.js";
import { OpenAIEmbedding } from "./embeddings/OpenAIEmbedding.js";
import { OpenAI } from "./llm/LLM.js";

import { PromptHelper } from "./PromptHelper.js";
import { SimpleNodeParser } from "./nodeParsers/SimpleNodeParser.js";

import { AsyncLocalStorage } from "@llamaindex/env";
import type { ServiceContext } from "./ServiceContext.js";
import type { BaseEmbedding } from "./embeddings/types.js";
import type { LLM } from "./llm/types.js";
import type { NodeParser } from "./nodeParsers/types.js";

export type PromptConfig = {
  llm?: string;
  lang?: string;
};

export interface Config {
  prompt: PromptConfig;
  llm: LLM | null;
  promptHelper: PromptHelper | null;
  embedModel: BaseEmbedding | null;
  nodeParser: NodeParser | null;
  callbackManager: CallbackManager | null;
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * @internal
 */
class GlobalSettings implements Config {
  private _prompt: PromptConfig = {};
  private _llm: LLM | null = null;
  private _promptHelper: PromptHelper | null = null;
  private _embedModel: BaseEmbedding | null = null;
  private _nodeParser: NodeParser | null = null;
  private _callbackManager: CallbackManager | null = null;
  private _chunkSize?: number;
  private _chunkOverlap?: number;

  get llm(): LLM {
    if (this._llm === null) {
      return (this._llm = new OpenAI());
    }

    return this._llm;
  }

  set llm(llm: LLM) {
    this._llm = llm;
  }

  get promptHelper(): PromptHelper {
    if (this._promptHelper === null) {
      return (this._promptHelper = new PromptHelper());
    }

    return this._promptHelper;
  }

  set promptHelper(promptHelper: PromptHelper) {
    this._promptHelper = promptHelper;
  }

  get embedModel(): BaseEmbedding {
    if (this._embedModel === null) {
      return (this._embedModel = new OpenAIEmbedding());
    }

    return this._embedModel;
  }

  set embedModel(embedModel: BaseEmbedding) {
    this._embedModel = embedModel;
  }

  get nodeParser(): NodeParser {
    if (this._nodeParser === null) {
      return (this._nodeParser = new SimpleNodeParser({
        chunkSize: this._chunkSize,
        chunkOverlap: this._chunkOverlap,
      }));
    }

    return this._nodeParser;
  }

  set nodeParser(nodeParser: NodeParser) {
    this._nodeParser = nodeParser;
  }

  get callbackManager(): CallbackManager {
    if (this._callbackManager === null) {
      return (this._callbackManager = new CallbackManager());
    }

    return this._callbackManager;
  }

  set callbackManager(callbackManager: CallbackManager) {
    this._callbackManager = callbackManager;
  }

  get chunkSize(): number | undefined {
    return this._chunkSize;
  }

  set chunkSize(chunkSize: number | undefined) {
    this._chunkSize = chunkSize;
  }

  get chunkOverlap(): number | undefined {
    return this._chunkOverlap;
  }

  set chunkOverlap(chunkOverlap: number | undefined) {
    this._chunkOverlap = chunkOverlap;
  }

  get prompt(): PromptConfig {
    return this._prompt;
  }

  set prompt(prompt: PromptConfig) {
    this._prompt = prompt;
  }
}

const callbackManagerAsyncLocalStorage =
  new AsyncLocalStorage<CallbackManager>();

/**
 * Get the current callback manager
 * @default defaultCallbackManager if no callback manager is set
 */
export function getCurrentCallbackManager() {
  return (
    callbackManagerAsyncLocalStorage.getStore() ?? Settings.callbackManager
  );
}

export function runWithCallbackManager<Result>(
  callbackManager: CallbackManager,
  fn: () => Result,
): Result {
  return callbackManagerAsyncLocalStorage.run(callbackManager, fn);
}

export const llmFromSettingsOrContext = (serviceContext?: ServiceContext) => {
  if (serviceContext?.llm) {
    return serviceContext.llm;
  }

  return Settings.llm;
};

export const nodeParserFromSettingsOrContext = (
  serviceContext?: ServiceContext,
) => {
  if (serviceContext?.nodeParser) {
    return serviceContext.nodeParser;
  }

  return Settings.nodeParser;
};

export const embedModelFromSettingsOrContext = (
  serviceContext?: ServiceContext,
) => {
  if (serviceContext?.embedModel) {
    return serviceContext.embedModel;
  }

  return Settings.embedModel;
};

export const promptHelperFromSettingsOrContext = (
  serviceContext?: ServiceContext,
) => {
  if (serviceContext?.promptHelper) {
    return serviceContext.promptHelper;
  }

  return Settings.promptHelper;
};

export const Settings = new GlobalSettings();
