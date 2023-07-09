import { BaseEmbedding, OpenAIEmbedding } from "./Embedding";
import { BaseLLMPredictor, ChatGPTLLMPredictor } from "./LLMPredictor";
import { ChatOpenAI } from "./LanguageModel";
import { NodeParser, SimpleNodeParser } from "./NodeParser";
import { PromptHelper } from "./PromptHelper";
import { CallbackManager } from "./callbacks/CallbackManager";

export interface ServiceContext {
  llmPredictor: BaseLLMPredictor;
  promptHelper: PromptHelper;
  embedModel: BaseEmbedding;
  nodeParser: NodeParser;
  callbackManager: CallbackManager;
  // llamaLogger: any;
}

export interface ServiceContextOptions {
  llmPredictor?: BaseLLMPredictor;
  llm?: ChatOpenAI;
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
    llmPredictor:
      options?.llmPredictor ??
      new ChatGPTLLMPredictor({ callbackManager, languageModel: options?.llm }),
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
  options: ServiceContextOptions
) {
  const newServiceContext = { ...serviceContext };
  if (options.llmPredictor) {
    newServiceContext.llmPredictor = options.llmPredictor;
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
