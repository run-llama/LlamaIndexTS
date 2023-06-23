import { BaseEmbedding, OpenAIEmbedding } from "./Embedding";
import { BaseLLMPredictor, ChatGPTLLMPredictor } from "./LLMPredictor";
import { BaseLanguageModel } from "./LanguageModel";
import { NodeParser, SimpleNodeParser } from "./NodeParser";

export interface ServiceContext {
  llmPredictor: BaseLLMPredictor;
  // promptHelper: any;
  embedModel: BaseEmbedding;
  nodeParser: NodeParser;
  // llamaLogger: any;
  // callbackManager: any;
}

export interface ServiceContextOptions {
  llmPredictor?: BaseLLMPredictor;
  llm?: BaseLanguageModel;
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
  };

  return serviceContext;
}
