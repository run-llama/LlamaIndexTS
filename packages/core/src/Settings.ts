import { CallbackManager } from "./callbacks/CallbackManager.js";
import { OpenAIEmbedding } from "./embeddings/OpenAIEmbedding.js";
import { OpenAI } from "./llm/open_ai.js";

import { PromptHelper } from "./PromptHelper.js";
import { SimpleNodeParser } from "./nodeParsers/SimpleNodeParser.js";

import { AsyncLocalStorage, getEnv } from "@llamaindex/env";
import type { ServiceContext } from "./ServiceContext.js";
import type { BaseEmbedding } from "./embeddings/types.js";
import {
  getCallbackManager,
  setCallbackManager,
  withCallbackManager,
} from "./internal/settings/CallbackManager.js";
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
  #prompt: PromptConfig = {};
  #llm: LLM | null = null;
  #promptHelper: PromptHelper | null = null;
  #embedModel: BaseEmbedding | null = null;
  #nodeParser: NodeParser | null = null;
  #chunkSize?: number;
  #chunkOverlap?: number;

  #llmAsyncLocalStorage = new AsyncLocalStorage<LLM>();
  #promptHelperAsyncLocalStorage = new AsyncLocalStorage<PromptHelper>();
  #embedModelAsyncLocalStorage = new AsyncLocalStorage<BaseEmbedding>();
  #nodeParserAsyncLocalStorage = new AsyncLocalStorage<NodeParser>();
  #chunkSizeAsyncLocalStorage = new AsyncLocalStorage<number>();
  #chunkOverlapAsyncLocalStorage = new AsyncLocalStorage<number>();
  #promptAsyncLocalStorage = new AsyncLocalStorage<PromptConfig>();

  get debug() {
    const debug = getEnv("DEBUG");
    return (
      getEnv("NODE_ENV") === "development" &&
      Boolean(debug) &&
      debug?.includes("llamaindex")
    );
  }

  get llm(): LLM {
    if (this.#llm === null) {
      this.#llm = new OpenAI();
    }

    return this.#llmAsyncLocalStorage.getStore() ?? this.#llm;
  }

  set llm(llm: LLM) {
    this.#llm = llm;
  }

  withLLM<Result>(llm: LLM, fn: () => Result): Result {
    return this.#llmAsyncLocalStorage.run(llm, fn);
  }

  get promptHelper(): PromptHelper {
    if (this.#promptHelper === null) {
      this.#promptHelper = new PromptHelper();
    }

    return this.#promptHelperAsyncLocalStorage.getStore() ?? this.#promptHelper;
  }

  set promptHelper(promptHelper: PromptHelper) {
    this.#promptHelper = promptHelper;
  }

  withPromptHelper<Result>(
    promptHelper: PromptHelper,
    fn: () => Result,
  ): Result {
    return this.#promptHelperAsyncLocalStorage.run(promptHelper, fn);
  }

  get embedModel(): BaseEmbedding {
    if (this.#embedModel === null) {
      this.#embedModel = new OpenAIEmbedding();
    }

    return this.#embedModelAsyncLocalStorage.getStore() ?? this.#embedModel;
  }

  set embedModel(embedModel: BaseEmbedding) {
    this.#embedModel = embedModel;
  }

  withEmbedModel<Result>(embedModel: BaseEmbedding, fn: () => Result): Result {
    return this.#embedModelAsyncLocalStorage.run(embedModel, fn);
  }

  get nodeParser(): NodeParser {
    if (this.#nodeParser === null) {
      this.#nodeParser = new SimpleNodeParser({
        chunkSize: this.#chunkSize,
        chunkOverlap: this.#chunkOverlap,
      });
    }

    return this.#nodeParserAsyncLocalStorage.getStore() ?? this.#nodeParser;
  }

  set nodeParser(nodeParser: NodeParser) {
    this.#nodeParser = nodeParser;
  }

  withNodeParser<Result>(nodeParser: NodeParser, fn: () => Result): Result {
    return this.#nodeParserAsyncLocalStorage.run(nodeParser, fn);
  }

  get callbackManager(): CallbackManager {
    return getCallbackManager();
  }

  set callbackManager(callbackManager: CallbackManager) {
    setCallbackManager(callbackManager);
  }

  withCallbackManager<Result>(
    callbackManager: CallbackManager,
    fn: () => Result,
  ): Result {
    return withCallbackManager(callbackManager, fn);
  }

  set chunkSize(chunkSize: number | undefined) {
    this.#chunkSize = chunkSize;
  }

  get chunkSize(): number | undefined {
    return this.#chunkSizeAsyncLocalStorage.getStore() ?? this.#chunkSize;
  }

  withChunkSize<Result>(chunkSize: number, fn: () => Result): Result {
    return this.#chunkSizeAsyncLocalStorage.run(chunkSize, fn);
  }

  get chunkOverlap(): number | undefined {
    return this.#chunkOverlapAsyncLocalStorage.getStore() ?? this.#chunkOverlap;
  }

  set chunkOverlap(chunkOverlap: number | undefined) {
    this.#chunkOverlap = chunkOverlap;
  }

  withChunkOverlap<Result>(chunkOverlap: number, fn: () => Result): Result {
    return this.#chunkOverlapAsyncLocalStorage.run(chunkOverlap, fn);
  }

  get prompt(): PromptConfig {
    return this.#promptAsyncLocalStorage.getStore() ?? this.#prompt;
  }

  set prompt(prompt: PromptConfig) {
    this.#prompt = prompt;
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
