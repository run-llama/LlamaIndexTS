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
  llm: LLM;
  promptHelper: PromptHelper;
  embedModel: BaseEmbedding;
  nodeParser: NodeParser;
  callbackManager: CallbackManager;
  chunkSize?: number;
  chunkOverlap?: number;
}

// Determine the global object based on the environment
const globalObject: any = typeof window !== "undefined" ? window : global;

// Initialize or access a global config object
const globalConfigKey = "__GLOBAL_LITS__";

if (!globalObject[globalConfigKey]) {
  globalObject[globalConfigKey] = {
    prompt: {},
    llm: new OpenAI(),
    embedModel: new OpenAIEmbedding(),
    callbackManager: new CallbackManager(),
    nodeParser: new SimpleNodeParser(),
    promptHelper: new PromptHelper(),
  } satisfies Partial<Config>;
}

export const Settings: Config = globalObject[globalConfigKey];
