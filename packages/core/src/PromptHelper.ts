import { globalsHelper } from "./GlobalsHelper";
import { SimplePrompt } from "./Prompt";
import { SentenceSplitter } from "./TextSplitter";
import {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_NUM_OUTPUTS,
  DEFAULT_CHUNK_OVERLAP_RATIO,
  DEFAULT_PADDING,
} from "./constants";

export function getEmptyPromptTxt(prompt: SimplePrompt) {
  return prompt({});
}

/**
 * Get biggest empty prompt size from a list of prompts.
 * Used to calculate the maximum size of inputs to the LLM.
 * @param prompts
 * @returns
 */
export function getBiggestPrompt(prompts: SimplePrompt[]) {
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
  tokenizer: (text: string) => string[];
  separator = " ";

  constructor(
    contextWindow = DEFAULT_CONTEXT_WINDOW,
    numOutput = DEFAULT_NUM_OUTPUTS,
    chunkOverlapRatio = DEFAULT_CHUNK_OVERLAP_RATIO,
    chunkSizeLimit?: number,
    tokenizer?: (text: string) => string[],
    separator = " "
  ) {
    this.contextWindow = contextWindow;
    this.numOutput = numOutput;
    this.chunkOverlapRatio = chunkOverlapRatio;
    this.chunkSizeLimit = chunkSizeLimit;
    this.tokenizer = tokenizer || globalsHelper.tokenizer();
    this.separator = separator;
  }

  /**
   * Given a prompt, return the maximum size of the inputs to the prompt.
   * @param prompt
   * @returns
   */
  private getAvailableContextSize(prompt: SimplePrompt) {
    const emptyPromptText = getEmptyPromptTxt(prompt);
    const promptTokens = this.tokenizer(emptyPromptText);
    const numPromptTokens = promptTokens.length;

    return this.contextWindow - numPromptTokens - this.numOutput;
  }

  /**
   * Find the maximum size of each chunk given a prompt.
   * @param prompt
   * @param numChunks
   * @param padding
   * @returns
   */
  private getAvailableChunkSize(
    prompt: SimplePrompt,
    numChunks = 1,
    padding = 5
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
   * @param prompt
   * @param numChunks
   * @param padding
   * @returns
   */
  getTextSplitterGivenPrompt(
    prompt: SimplePrompt,
    numChunks = 1,
    padding = DEFAULT_PADDING
  ) {
    const chunkSize = this.getAvailableChunkSize(prompt, numChunks, padding);
    if (chunkSize === 0) {
      throw new Error("Got 0 as available chunk size");
    }
    const chunkOverlap = this.chunkOverlapRatio * chunkSize;
    const textSplitter = new SentenceSplitter(chunkSize, chunkOverlap);
    return textSplitter;
  }

  /**
   * Repack resplits the strings based on the optimal text splitter.
   * @param prompt
   * @param textChunks
   * @param padding
   * @returns
   */
  repack(
    prompt: SimplePrompt,
    textChunks: string[],
    padding = DEFAULT_PADDING
  ) {
    const textSplitter = this.getTextSplitterGivenPrompt(prompt, 1, padding);
    const combinedStr = textChunks.join("\n\n");
    return textSplitter.splitText(combinedStr);
  }
}
