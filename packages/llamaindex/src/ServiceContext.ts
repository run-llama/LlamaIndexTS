import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import { PromptHelper } from "@llamaindex/core/indices";
import type { LLM } from "@llamaindex/core/llms";
import {
  type NodeParser,
  SentenceSplitter,
} from "@llamaindex/core/node-parser";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";

/**
 * The ServiceContext is a collection of components that are used in different parts of the application.
 */
export interface ServiceContext {
  llm: LLM;
  promptHelper: PromptHelper;
  embedModel: BaseEmbedding;
  nodeParser: NodeParser;
  // llamaLogger: any;
}

export interface ServiceContextOptions {
  llm?: LLM;
  promptHelper?: PromptHelper;
  embedModel?: BaseEmbedding;
  nodeParser?: NodeParser;
  // NodeParser arguments
  chunkSize?: number;
  chunkOverlap?: number;
}

export function serviceContextFromDefaults(options?: ServiceContextOptions) {
  const serviceContext: ServiceContext = {
    llm: options?.llm ?? new OpenAI(),
    embedModel: options?.embedModel ?? new OpenAIEmbedding(),
    nodeParser:
      options?.nodeParser ??
      new SentenceSplitter({
        chunkSize: options?.chunkSize,
        chunkOverlap: options?.chunkOverlap,
      }),
    promptHelper: options?.promptHelper ?? new PromptHelper(),
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
  return newServiceContext;
}
