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

  #callbackManagerAsyncLocalStorage = new AsyncLocalStorage<CallbackManager>();
  #llmAsyncLocalStorage = new AsyncLocalStorage<LLM>();
  #promptHelperAsyncLocalStorage = new AsyncLocalStorage<PromptHelper>();
  #embedModelAsyncLocalStorage = new AsyncLocalStorage<BaseEmbedding>();
  #nodeParserAsyncLocalStorage = new AsyncLocalStorage<NodeParser>();
  #chunkSizeAsyncLocalStorage = new AsyncLocalStorage<number>();
  #chunkOverlapAsyncLocalStorage = new AsyncLocalStorage<number>();
  #promptAsyncLocalStorage = new AsyncLocalStorage<PromptConfig>();

  get llm(): LLM {
    if (this._llm === null) {
      this._llm = new OpenAI();
    }

    return this.#llmAsyncLocalStorage.getStore() ?? this._llm;
  }

  set llm(llm: LLM) {
    this._llm = llm;
  }

  withLLM<Result>(llm: LLM, fn: () => Result): Result {
    return this.#llmAsyncLocalStorage.run(llm, fn);
  }

  get promptHelper(): PromptHelper {
    if (this._promptHelper === null) {
      this._promptHelper = new PromptHelper();
    }

    return this.#promptHelperAsyncLocalStorage.getStore() ?? this._promptHelper;
  }

  set promptHelper(promptHelper: PromptHelper) {
    this._promptHelper = promptHelper;
  }

  withPromptHelper<Result>(
    promptHelper: PromptHelper,
    fn: () => Result,
  ): Result {
    return this.#promptHelperAsyncLocalStorage.run(promptHelper, fn);
  }

  get embedModel(): BaseEmbedding {
    if (this._embedModel === null) {
      this._embedModel = new OpenAIEmbedding();
    }

    return this.#embedModelAsyncLocalStorage.getStore() ?? this._embedModel;
  }

  set embedModel(embedModel: BaseEmbedding) {
    this._embedModel = embedModel;
  }

  withEmbedModel<Result>(embedModel: BaseEmbedding, fn: () => Result): Result {
    return this.#embedModelAsyncLocalStorage.run(embedModel, fn);
  }

  get nodeParser(): NodeParser {
    if (this._nodeParser === null) {
      this._nodeParser = new SimpleNodeParser({
        chunkSize: this._chunkSize,
        chunkOverlap: this._chunkOverlap,
      });
    }

    return this.#nodeParserAsyncLocalStorage.getStore() ?? this._nodeParser;
  }

  set nodeParser(nodeParser: NodeParser) {
    this._nodeParser = nodeParser;
  }

  withNodeParser<Result>(nodeParser: NodeParser, fn: () => Result): Result {
    return this.#nodeParserAsyncLocalStorage.run(nodeParser, fn);
  }

  get callbackManager(): CallbackManager {
    if (this._callbackManager === null) {
      this._callbackManager = new CallbackManager();
    }

    return (
      this.#callbackManagerAsyncLocalStorage.getStore() ?? this._callbackManager
    );
  }

  set callbackManager(callbackManager: CallbackManager) {
    this._callbackManager = callbackManager;
  }

  withCallbackManager<Result>(
    callbackManager: CallbackManager,
    fn: () => Result,
  ): Result {
    return this.#callbackManagerAsyncLocalStorage.run(callbackManager, fn);
  }

  set chunkSize(chunkSize: number | undefined) {
    this._chunkSize = chunkSize;
  }

  get chunkSize(): number | undefined {
    return this.#chunkSizeAsyncLocalStorage.getStore() ?? this._chunkSize;
  }

  withChunkSize<Result>(chunkSize: number, fn: () => Result): Result {
    return this.#chunkSizeAsyncLocalStorage.run(chunkSize, fn);
  }

  get chunkOverlap(): number | undefined {
    return this.#chunkOverlapAsyncLocalStorage.getStore() ?? this._chunkOverlap;
  }

  set chunkOverlap(chunkOverlap: number | undefined) {
    this._chunkOverlap = chunkOverlap;
  }

  withChunkOverlap<Result>(chunkOverlap: number, fn: () => Result): Result {
    return this.#chunkOverlapAsyncLocalStorage.run(chunkOverlap, fn);
  }

  get prompt(): PromptConfig {
    return this.#promptAsyncLocalStorage.getStore() ?? this._prompt;
  }

  set prompt(prompt: PromptConfig) {
    this._prompt = prompt;
  }

  withPrompt<Result>(prompt: PromptConfig, fn: () => Result): Result {
    return this.#promptAsyncLocalStorage.run(prompt, fn);
  }
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
