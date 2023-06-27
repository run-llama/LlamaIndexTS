import { BaseEmbedding, OpenAIEmbedding } from "./Embedding";
import { BaseLLMPredictor, ChatGPTLLMPredictor } from "./LLMPredictor";
import { BaseLanguageModel } from "./LanguageModel";
import { NodeParser, SimpleNodeParser } from "./NodeParser";
import { PromptHelper } from "./PromptHelper";

export interface ServiceContext {
  llmPredictor: BaseLLMPredictor;
  promptHelper: PromptHelper;
  embedModel: BaseEmbedding;
  nodeParser: NodeParser;
  // llamaLogger: any;
  // callbackManager: any;
}

export interface ServiceContextOptions {
  llmPredictor?: BaseLLMPredictor;
  llm?: BaseLanguageModel;
  promptHelper?: PromptHelper;
  embedModel?: BaseEmbedding;
  nodeParser?: NodeParser;
  // NodeParser arguments
  chunkSize?: number;
  chunkOverlap: number;
}

export function serviceContextFromDefaults(options: ServiceContextOptions) {
  const serviceContext: ServiceContext = {
    llmPredictor: options.llmPredictor ?? new ChatGPTLLMPredictor(),
    embedModel: options.embedModel ?? new OpenAIEmbedding(),
    nodeParser: options.nodeParser ?? new SimpleNodeParser(),
    promptHelper: options.promptHelper ?? new PromptHelper(),
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
  return newServiceContext;
}
