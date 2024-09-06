import { SentenceSplitter } from "@llamaindex/core/node-parser";
import type { PromptTemplate } from "@llamaindex/core/prompts";
import { type Tokenizer, tokenizers } from "@llamaindex/env";
import {
  DEFAULT_CHUNK_OVERLAP_RATIO,
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_NUM_OUTPUTS,
  DEFAULT_PADDING,
} from "./constants.js";

/**
 * Get the empty prompt text given a prompt.
 */
export function getEmptyPromptTxt(prompt: PromptTemplate) {
  return prompt.format({
    ...Object.fromEntries(
      [...prompt.templateVars.keys()].map((key) => [key, ""]),
    ),
  });
}

/**
 * Get biggest empty prompt size from a list of prompts.
 * Used to calculate the maximum size of inputs to the LLM.
 */
export function getBiggestPrompt(prompts: PromptTemplate[]) {
  const emptyPromptTexts = prompts.map(getEmptyPromptTxt);
  const emptyPromptLengths = emptyPromptTexts.map((text) => text.length);
  const maxEmptyPromptLength = Math.max(...emptyPromptLengths);
  const maxEmptyPromptIndex = emptyPromptLengths.indexOf(maxEmptyPromptLength);
  return prompts[maxEmptyPromptIndex];
}

/**
 * A collection of helper functions for working with prompts.
 */
export class PromptHelper {
  contextWindow = DEFAULT_CONTEXT_WINDOW;
  numOutput = DEFAULT_NUM_OUTPUTS;
  chunkOverlapRatio = DEFAULT_CHUNK_OVERLAP_RATIO;
  chunkSizeLimit?: number;
  tokenizer: Tokenizer;
  separator = " ";

  // eslint-disable-next-line max-params
  constructor(
    contextWindow = DEFAULT_CONTEXT_WINDOW,
    numOutput = DEFAULT_NUM_OUTPUTS,
    chunkOverlapRatio = DEFAULT_CHUNK_OVERLAP_RATIO,
    chunkSizeLimit?: number,
    tokenizer?: Tokenizer,
    separator = " ",
  ) {
    this.contextWindow = contextWindow;
    this.numOutput = numOutput;
    this.chunkOverlapRatio = chunkOverlapRatio;
    this.chunkSizeLimit = chunkSizeLimit;
    this.tokenizer = tokenizer ?? tokenizers.tokenizer();
    this.separator = separator;
  }

  /**
   * Given a prompt, return the maximum size of the inputs to the prompt.
   * @param prompt
   * @returns
   */
  private getAvailableContextSize(prompt: PromptTemplate) {
    const emptyPromptText = getEmptyPromptTxt(prompt);
    const promptTokens = this.tokenizer.encode(emptyPromptText);
    const numPromptTokens = promptTokens.length;

    return this.contextWindow - numPromptTokens - this.numOutput;
  }

  /**
   * Find the maximum size of each chunk given a prompt.
   */
  private getAvailableChunkSize(
    prompt: PromptTemplate,
    numChunks = 1,
    padding = 5,
  ) {
    const availableContextSize = this.getAvailableContextSize(prompt);

    const result = Math.floor(availableContextSize / numChunks) - padding;

    if (this.chunkSizeLimit) {
      return Math.min(this.chunkSizeLimit, result);
    } else {
      return result;
    }
  }

  /**
   * Creates a text splitter with the correct chunk sizes and overlaps given a prompt.
   */
  getTextSplitterGivenPrompt(
    prompt: PromptTemplate,
    numChunks = 1,
    padding = DEFAULT_PADDING,
  ) {
    const chunkSize = this.getAvailableChunkSize(prompt, numChunks, padding);
    if (chunkSize === 0) {
      throw new Error("Got 0 as available chunk size");
    }
    const chunkOverlap = this.chunkOverlapRatio * chunkSize;
    return new SentenceSplitter({ chunkSize, chunkOverlap });
  }

  /**
   * Repack resplits the strings based on the optimal text splitter.
   */
  repack(
    prompt: PromptTemplate,
    textChunks: string[],
    padding = DEFAULT_PADDING,
  ) {
    const textSplitter = this.getTextSplitterGivenPrompt(prompt, 1, padding);
    const combinedStr = textChunks.join("\n\n");
    return textSplitter.splitText(combinedStr);
  }
}
