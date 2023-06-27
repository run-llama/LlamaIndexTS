import { chunk } from "lodash";
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

export function getBiggestPrompt(prompts: SimplePrompt[]) {
  const emptyPromptTexts = prompts.map(getEmptyPromptTxt);
  const emptyPromptLengths = emptyPromptTexts.map((text) => text.length);
  const maxEmptyPromptLength = Math.max(...emptyPromptLengths);
  const maxEmptyPromptIndex = emptyPromptLengths.indexOf(maxEmptyPromptLength);
  return prompts[maxEmptyPromptIndex];
}

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

  private getAvailableContextSize(prompt: SimplePrompt) {
    const emptyPromptText = getEmptyPromptTxt(prompt);
    const promptTokens = this.tokenizer(emptyPromptText);
    const numPromptTokens = promptTokens.length;

    return this.contextWindow - numPromptTokens - this.numOutput;
  }

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

  truncate(
    prompt: SimplePrompt,
    textChunks: string[],
    padding = DEFAULT_PADDING
  ) {
    throw new Error("Not implemented yet");
  }

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
