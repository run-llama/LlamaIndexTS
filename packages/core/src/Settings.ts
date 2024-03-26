import {
  CallbackManager,
  OpenAI,
  OpenAIEmbedding,
  PromptHelper,
  SimpleNodeParser,
  type BaseEmbedding,
  type LLM,
  type NodeParser,
} from "./index.edge.js";

type PromptConfig = {
  llm?: string;
  lang?: string;
};

interface Config {
  prompt: PromptConfig;
  llm: LLM | null;
  promptHelper: PromptHelper | null;
  embedModel: BaseEmbedding | null;
  nodeParser: NodeParser | null;
  callbackManager: CallbackManager | null;
  chunkSize?: number;
  chunkOverlap?: number;
}

// Global settings
export class GlobalSettings implements Config {
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
      return new OpenAI();
    }

    return this._llm;
  }

  set llm(llm: LLM) {
    this._llm = llm;
  }

  get promptHelper(): PromptHelper {
    if (this._promptHelper === null) {
      return new PromptHelper();
    }

    return this._promptHelper;
  }

  set promptHelper(promptHelper: PromptHelper) {
    this._promptHelper = promptHelper;
  }

  get embedModel(): BaseEmbedding {
    if (this._embedModel === null) {
      return new OpenAIEmbedding();
    }

    return this._embedModel;
  }

  set embedModel(embedModel: BaseEmbedding) {
    this._embedModel = embedModel;
  }

  get nodeParser(): NodeParser {
    if (this._nodeParser === null) {
      return new SimpleNodeParser({
        chunkSize: this._chunkSize,
        chunkOverlap: this._chunkOverlap,
      });
    }

    return this._nodeParser;
  }

  set nodeParser(nodeParser: NodeParser) {
    this._nodeParser = nodeParser;
  }

  get callbackManager(): CallbackManager {
    if (this._callbackManager === null) {
      return new CallbackManager();
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

// Determine the global object based on the environment
const globalObject: any = typeof window !== "undefined" ? window : global;

// Initialize or access a global config object
const globalConfigKey = "__GLOBAL_LITS__";

if (!globalObject[globalConfigKey]) {
  globalObject[globalConfigKey] = new GlobalSettings();
}

export const Settings = globalObject[globalConfigKey] as GlobalSettings;
