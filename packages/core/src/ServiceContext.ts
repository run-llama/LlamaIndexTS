import { CallbackManager } from "./callbacks/CallbackManager";
import { BaseEmbedding, OpenAIEmbedding } from "./embeddings";
import { LLM, OpenAI } from "./llm/LLM";
import { NodeParser, SimpleNodeParser } from "./NodeParser";
import { PromptHelper } from "./PromptHelper";

/**
 * The ServiceContext is a collection of components that are used in different parts of the application.
 */
export interface ServiceContext {
  llm: LLM;
  promptHelper: PromptHelper;
  embedModel: BaseEmbedding;
  nodeParser: NodeParser;
  callbackManager: CallbackManager;
  // llamaLogger: any;
}

export interface ServiceContextOptions {
  llm?: LLM;
  promptHelper?: PromptHelper;
  embedModel?: BaseEmbedding;
  nodeParser?: NodeParser;
  callbackManager?: CallbackManager;
  // NodeParser arguments
  chunkSize?: number;
  chunkOverlap?: number;
}

export function serviceContextFromDefaults(options?: ServiceContextOptions) {
  const callbackManager = options?.callbackManager ?? new CallbackManager();
  const serviceContext: ServiceContext = {
    llm: options?.llm ?? new OpenAI(),
    embedModel: options?.embedModel ?? new OpenAIEmbedding(),
    nodeParser:
      options?.nodeParser ??
      new SimpleNodeParser({
        chunkSize: options?.chunkSize,
        chunkOverlap: options?.chunkOverlap,
      }),
    promptHelper: options?.promptHelper ?? new PromptHelper(),
    callbackManager,
  };

  return serviceContext;
}

export function serviceContextFromServiceContext(
  serviceContext: ServiceContext,
  options: ServiceContextOptions,
) {
  const newServiceContext = { ...serviceContext };
  if (options.llm) {
    newServiceContext.llm = options.llm;
  }
  if (options.promptHelper) {
    newServiceContext.promptHelper = options.promptHelper;
  }
  if (options.embedModel) {
    newServiceContext.embedModel = options.embedModel;
  }
  if (options.nodeParser) {
    newServiceContext.nodeParser = options.nodeParser;
  }
  if (options.callbackManager) {
    newServiceContext.callbackManager = options.callbackManager;
  }
  return newServiceContext;
}
