import {
  type CallbackManager,
  Settings as CoreSettings,
} from "@llamaindex/core/global";

import { PromptHelper } from "@llamaindex/core/indices";

import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { LLM } from "@llamaindex/core/llms";
import {
  type NodeParser,
  SentenceSplitter,
} from "@llamaindex/core/node-parser";
import { AsyncLocalStorage } from "@llamaindex/env";

export type PromptConfig = {
  llm?: string;
  lang?: string;
};

export interface Config {
  prompt: PromptConfig;
  promptHelper: PromptHelper | null;
  embedModel: BaseEmbedding | null;
  nodeParser: NodeParser | null;
  callbackManager: CallbackManager | null;
  chunkSize: number | undefined;
  chunkOverlap: number | undefined;
}

/**
 * @internal
 */
class GlobalSettings implements Config {
  #prompt: PromptConfig = {};
  #promptHelper: PromptHelper | null = null;
  #nodeParser: NodeParser | null = null;
  #chunkOverlap?: number;

  #promptHelperAsyncLocalStorage = new AsyncLocalStorage<PromptHelper>();
  #nodeParserAsyncLocalStorage = new AsyncLocalStorage<NodeParser>();
  #chunkOverlapAsyncLocalStorage = new AsyncLocalStorage<number>();
  #promptAsyncLocalStorage = new AsyncLocalStorage<PromptConfig>();

  get debug() {
    return CoreSettings.debug;
  }

  get llm(): LLM {
    return CoreSettings.llm;
  }

  set llm(llm: LLM) {
    CoreSettings.llm = llm;
  }

  withLLM<Result>(llm: LLM, fn: () => Result): Result {
    return CoreSettings.withLLM(llm, fn);
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
    return CoreSettings.embedModel;
  }

  set embedModel(embedModel: BaseEmbedding) {
    CoreSettings.embedModel = embedModel;
  }

  withEmbedModel<Result>(embedModel: BaseEmbedding, fn: () => Result): Result {
    return CoreSettings.withEmbedModel(embedModel, fn);
  }

  get nodeParser(): NodeParser {
    if (this.#nodeParser === null) {
      this.#nodeParser = new SentenceSplitter({
        chunkSize: this.chunkSize,
        chunkOverlap: this.chunkOverlap,
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
    return CoreSettings.callbackManager;
  }

  set callbackManager(callbackManager: CallbackManager) {
    CoreSettings.callbackManager = callbackManager;
  }

  withCallbackManager<Result>(
    callbackManager: CallbackManager,
    fn: () => Result,
  ): Result {
    return CoreSettings.withCallbackManager(callbackManager, fn);
  }

  set chunkSize(chunkSize: number | undefined) {
    CoreSettings.chunkSize = chunkSize;
  }

  get chunkSize(): number | undefined {
    return CoreSettings.chunkSize;
  }

  withChunkSize<Result>(chunkSize: number, fn: () => Result): Result {
    return CoreSettings.withChunkSize(chunkSize, fn);
  }

  get chunkOverlap(): number | undefined {
    return this.#chunkOverlapAsyncLocalStorage.getStore() ?? this.#chunkOverlap;
  }

  set chunkOverlap(chunkOverlap: number | undefined) {
    if (typeof chunkOverlap === "number") {
      this.#chunkOverlap = chunkOverlap;
    }
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

export const llmFromSettings = () => {
  return Settings.llm;
};

export const nodeParserFromSettings = () => {
  return Settings.nodeParser;
};

export const embedModelFromSettings = () => {
  return Settings.embedModel;
};

export const promptHelperFromSettings = () => {
  return Settings.promptHelper;
};

export const Settings = new GlobalSettings();
