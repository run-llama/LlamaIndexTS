import {
  type CallbackManager,
  Settings as CoreSettings,
} from "@llamaindex/core/global";
import { OpenAI } from "@llamaindex/openai";

import { PromptHelper } from "@llamaindex/core/indices";

import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { LLM } from "@llamaindex/core/llms";
import {
  type NodeParser,
  SentenceSplitter,
} from "@llamaindex/core/node-parser";
import type { LoadTransformerEvent } from "@llamaindex/env";
import { AsyncLocalStorage, getEnv } from "@llamaindex/env";
import type { ServiceContext } from "./ServiceContext.js";
import {
  getEmbeddedModel,
  setEmbeddedModel,
  withEmbeddedModel,
} from "./internal/settings/EmbedModel.js";

declare module "@llamaindex/core/global" {
  interface LlamaIndexEventMaps {
    "load-transformers": LoadTransformerEvent;
  }
}

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
    const debug = getEnv("DEBUG");
    return (
      (Boolean(debug) && debug?.includes("llamaindex")) ||
      debug === "*" ||
      debug === "true"
    );
  }

  get llm(): LLM {
    // fixme: we might need check internal error instead of try-catch here
    try {
      CoreSettings.llm;
    } catch (error) {
      CoreSettings.llm = new OpenAI();
    }
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
    return getEmbeddedModel();
  }

  set embedModel(embedModel: BaseEmbedding) {
    setEmbeddedModel(embedModel);
  }

  withEmbedModel<Result>(embedModel: BaseEmbedding, fn: () => Result): Result {
    return withEmbeddedModel(embedModel, fn);
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
