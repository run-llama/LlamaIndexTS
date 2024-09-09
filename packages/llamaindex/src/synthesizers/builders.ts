import { getBiggestPrompt, type PromptHelper } from "@llamaindex/core/indices";
import type { LLM } from "@llamaindex/core/llms";
import {
  PromptMixin,
  defaultRefinePrompt,
  defaultTextQAPrompt,
  defaultTreeSummarizePrompt,
  type ModuleRecord,
  type PromptsRecord,
  type RefinePrompt,
  type TextQAPrompt,
  type TreeSummarizePrompt,
} from "@llamaindex/core/prompts";
import type { QueryType } from "@llamaindex/core/query-engine";
import { extractText, streamConverter } from "@llamaindex/core/utils";
import type { ServiceContext } from "../ServiceContext.js";
import {
  llmFromSettingsOrContext,
  promptHelperFromSettingsOrContext,
} from "../Settings.js";
import type { ResponseBuilder, ResponseBuilderQuery } from "./types.js";

/**
 * Response modes of the response synthesizer
 */
enum ResponseMode {
  REFINE = "refine",
  COMPACT = "compact",
  TREE_SUMMARIZE = "tree_summarize",
  SIMPLE = "simple",
}


export function getResponseBuilder(
  serviceContext?: ServiceContext,
  responseMode?: ResponseMode,
): ResponseBuilder {
  switch (responseMode) {
    case ResponseMode.SIMPLE:
      return new SimpleResponseBuilder(serviceContext);
    case ResponseMode.REFINE:
      return new Refine(serviceContext);
    case ResponseMode.TREE_SUMMARIZE:
      return new TreeSummarize(serviceContext);
    default:
      return new CompactAndRefine(serviceContext);
  }
}

export type ResponseBuilderPrompts =
  | TextQAPrompt
  | TreeSummarizePrompt
  | RefinePrompt;
