import { type Tokenizer, tokenizers } from "@llamaindex/env";
import {
  DEFAULT_CHUNK_OVERLAP_RATIO,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_NUM_OUTPUTS,
  DEFAULT_PADDING,
  Settings,
} from "../global";
import type { LLMMetadata } from "../llms";
import { TextSplitter, TokenTextSplitter, truncateText } from "../node-parser";
import { BasePromptTemplate, PromptTemplate } from "../prompts";

/**
 * Get the empty prompt text given a prompt.
 */
function getEmptyPromptTxt(prompt: PromptTemplate): string {
  return prompt.format(
    Object.fromEntries([...prompt.templateVars.keys()].map((key) => [key, ""])),
  );
}

/**
 * Get biggest empty prompt size from a list of prompts.
 * Used to calculate the maximum size of inputs to the LLM.
 */
export function getBiggestPrompt(prompts: PromptTemplate[]): PromptTemplate {
  const emptyPromptTexts = prompts.map(getEmptyPromptTxt);
  const emptyPromptLengths = emptyPromptTexts.map((text) => text.length);
  const maxEmptyPromptLength = Math.max(...emptyPromptLengths);
  const maxEmptyPromptIndex = emptyPromptLengths.indexOf(maxEmptyPromptLength);
  return prompts[maxEmptyPromptIndex]!;
}

export type PromptHelperOptions = {
  contextWindow?: number | undefined;
  numOutput?: number | undefined;
  chunkOverlapRatio?: number | undefined;
  chunkSizeLimit?: number | undefined;
  tokenizer?: Tokenizer | undefined;
  separator?: string | undefined;
};

/**
 * A collection of helper functions for working with prompts.
 */
export class PromptHelper {
  contextWindow: number;
  numOutput: number;
  chunkOverlapRatio: number;
  chunkSizeLimit: number | undefined;
  tokenizer: Tokenizer;
  separator: string;

  constructor(options: PromptHelperOptions = {}) {
    const {
      contextWindow = DEFAULT_CONTEXT_WINDOW,
      numOutput = DEFAULT_NUM_OUTPUTS,
      chunkOverlapRatio = DEFAULT_CHUNK_OVERLAP_RATIO,
      chunkSizeLimit,
      tokenizer,
      separator = " ",
    } = options;
    this.contextWindow = contextWindow;
    this.numOutput = numOutput;
    this.chunkOverlapRatio = chunkOverlapRatio;
    this.chunkSizeLimit = chunkSizeLimit;
    this.tokenizer = tokenizer ?? tokenizers.tokenizer();
    this.separator = separator;
  }

  /**
   * Calculate the available context size based on the number of prompt tokens.
   */
  #getAvailableContextSize(numPromptTokens: number): number {
    const contextSizeTokens =
      this.contextWindow - numPromptTokens - this.numOutput;
    if (contextSizeTokens < 0) {
      throw new Error(
        `Calculated available context size ${contextSizeTokens} is not non-negative.`,
      );
    }
    return contextSizeTokens;
  }

  /**
   * Calculate the available chunk size based on the prompt and other parameters.
   */
  #getAvailableChunkSize<Template extends BasePromptTemplate>(
    prompt: Template,
    numChunks: number = 1,
    padding: number = 5,
  ): number {
    let numPromptTokens = 0;

    if (prompt instanceof PromptTemplate) {
      numPromptTokens = this.tokenizer.encode(getEmptyPromptTxt(prompt)).length;
    }

    const availableContextSize = this.#getAvailableContextSize(numPromptTokens);
    let result = Math.floor(availableContextSize / numChunks) - padding;

    if (this.chunkSizeLimit !== undefined) {
      result = Math.min(this.chunkSizeLimit, result);
    }

    return result;
  }

  /**
   * Creates a text splitter configured to maximally pack the available context window.
   */
  getTextSplitterGivenPrompt(
    prompt: BasePromptTemplate,
    numChunks: number = 1,
    padding: number = DEFAULT_PADDING,
  ): TextSplitter {
    const chunkSize = this.#getAvailableChunkSize(prompt, numChunks, padding);
    if (chunkSize <= 0) {
      throw new TypeError(`Chunk size ${chunkSize} is not positive.`);
    }
    const chunkOverlap = Math.floor(this.chunkOverlapRatio * chunkSize);
    return new TokenTextSplitter({
      separator: this.separator,
      chunkSize,
      chunkOverlap,
      tokenizer: this.tokenizer,
    });
  }

  /**
   * Truncate text chunks to fit within the available context window.
   */
  truncate(
    prompt: BasePromptTemplate,
    textChunks: string[],
    padding: number = DEFAULT_PADDING,
  ): string[] {
    const textSplitter = this.getTextSplitterGivenPrompt(
      prompt,
      textChunks.length,
      padding,
    );
    return textChunks.map((chunk) => truncateText(chunk, textSplitter));
  }

  /**
   * Repack text chunks to better utilize the available context window.
   */
  repack(
    prompt: BasePromptTemplate,
    textChunks: string[],
    padding: number = DEFAULT_PADDING,
  ): string[] {
    const textSplitter = this.getTextSplitterGivenPrompt(prompt, 1, padding);
    const combinedStr = textChunks
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .join("\n\n");
    return textSplitter.splitText(combinedStr);
  }

  static fromLLMMetadata(
    metadata: LLMMetadata,
    options?: {
      chunkOverlapRatio?: number;
      chunkSizeLimit?: number;
      tokenizer?: Tokenizer;
      separator?: string;
    },
  ) {
    const {
      chunkOverlapRatio = DEFAULT_CHUNK_OVERLAP_RATIO,
      chunkSizeLimit = DEFAULT_CHUNK_SIZE,
      tokenizer = Settings.tokenizer,
      separator = " ",
    } = options ?? {};
    return new PromptHelper({
      contextWindow: metadata.contextWindow,
      // fixme: numOutput is not in LLMMetadata
      numOutput: DEFAULT_NUM_OUTPUTS,
      chunkOverlapRatio,
      chunkSizeLimit,
      tokenizer,
      separator,
    });
  }
}
