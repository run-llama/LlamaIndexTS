import type { Tokenizer } from "@llamaindex/env";
import { z } from "zod";
import { Settings } from "../global";
import { sentenceSplitterSchema } from "../schema";
import { MetadataAwareTextSplitter } from "./base";
import type { SplitterParams } from "./type";
import {
  splitByChar,
  splitByRegex,
  splitBySentenceTokenizer,
  splitBySep,
  type TextSplitterFn,
} from "./utils";

type _Split = {
  text: string;
  isSentence: boolean;
  tokenSize: number;
};

/**
 * Parse text with a preference for complete sentences.
 */
export class SentenceSplitter extends MetadataAwareTextSplitter {
  /**
   * The token chunk size for each chunk.
   */
  chunkSize: number = 1024;
  /**
   * The token overlap of each chunk when splitting.
   */
  chunkOverlap: number = 200;
  /**
   * Default separator for splitting into words
   */
  separator: string = " ";
  /**
   * Separator between paragraphs.
   */
  paragraphSeparator: string = "\n\n\n";
  /**
   * Backup regex for splitting into sentences.
   */
  secondaryChunkingRegex: string = "[^,.;。？！]+[,.;。？！]?";

  #chunkingTokenizerFn = splitBySentenceTokenizer();
  #splitFns: Set<TextSplitterFn> = new Set();
  #subSentenceSplitFns: Set<TextSplitterFn> = new Set();
  #tokenizer: Tokenizer;

  constructor(
    params?: z.input<typeof sentenceSplitterSchema> & SplitterParams,
  ) {
    super();
    if (params) {
      const parsedParams = sentenceSplitterSchema.parse(params);
      this.chunkSize = parsedParams.chunkSize;
      this.chunkOverlap = parsedParams.chunkOverlap;
      this.separator = parsedParams.separator;
      this.paragraphSeparator = parsedParams.paragraphSeparator;
      this.secondaryChunkingRegex = parsedParams.secondaryChunkingRegex;
    }
    this.#tokenizer = params?.tokenizer ?? Settings.tokenizer;
    this.#splitFns.add(splitBySep(this.paragraphSeparator));
    this.#splitFns.add(this.#chunkingTokenizerFn);

    this.#subSentenceSplitFns.add(splitByRegex(this.secondaryChunkingRegex));
    this.#subSentenceSplitFns.add(splitBySep(this.separator));
    this.#subSentenceSplitFns.add(splitByChar());
  }

  splitTextMetadataAware(text: string, metadata: string): string[] {
    const metadataLength = this.tokenSize(metadata);
    const effectiveChunkSize = this.chunkSize - metadataLength;
    if (effectiveChunkSize <= 0) {
      throw new Error(
        `Metadata length (${metadataLength}) is longer than chunk size (${this.chunkSize}). Consider increasing the chunk size or decreasing the size of your metadata to avoid this.`,
      );
    } else if (effectiveChunkSize < 50) {
      console.log(
        `Metadata length (${metadataLength}) is close to chunk size (${this.chunkSize}). Resulting chunks are less than 50 tokens. Consider increasing the chunk size or decreasing the size of your metadata to avoid this.`,
      );
    }
    return this._splitText(text, effectiveChunkSize);
  }

  splitText(text: string): string[] {
    return this._splitText(text, this.chunkSize);
  }

  _splitText(text: string, chunkSize: number): string[] {
    if (text === "") return [text];

    const callbackManager = Settings.callbackManager;

    callbackManager.dispatchEvent("chunking-start", {
      text: [text],
    });
    const splits = this.#split(text, chunkSize);
    const chunks = this.#merge(splits, chunkSize);

    callbackManager.dispatchEvent("chunking-end", {
      chunks,
    });
    return chunks;
  }

  #split(text: string, chunkSize: number): _Split[] {
    const tokenSize = this.tokenSize(text);
    if (tokenSize <= chunkSize) {
      return [
        {
          text,
          isSentence: true,
          tokenSize,
        },
      ];
    }
    const [textSplitsByFns, isSentence] = this.#getSplitsByFns(text);
    const textSplits: _Split[] = [];

    for (const textSplit of textSplitsByFns) {
      const tokenSize = this.tokenSize(textSplit);
      if (tokenSize <= chunkSize) {
        textSplits.push({
          text: textSplit,
          isSentence,
          tokenSize,
        });
      } else {
        const recursiveTextSplits = this.#split(textSplit, chunkSize);
        textSplits.push(...recursiveTextSplits);
      }
    }
    return textSplits;
  }

  #getSplitsByFns(text: string): [splits: string[], isSentence: boolean] {
    for (const splitFn of this.#splitFns) {
      const splits = splitFn(text);
      if (splits.length > 1) {
        return [splits, true];
      }
    }
    for (const splitFn of this.#subSentenceSplitFns) {
      const splits = splitFn(text);
      if (splits.length > 1) {
        return [splits, false];
      }
    }
    return [[text], true];
  }

  #merge(splits: _Split[], chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk: [string, number][] = [];
    let lastChunk: [string, number][] = [];
    let currentChunkLength = 0;
    let newChunk = true;

    const closeChunk = (): void => {
      chunks.push(currentChunk.map(([text]) => text).join(""));
      lastChunk = currentChunk;
      currentChunk = [];
      currentChunkLength = 0;
      newChunk = true;

      let lastIndex = lastChunk.length - 1;
      while (
        lastIndex >= 0 &&
        currentChunkLength + lastChunk[lastIndex][1] <= this.chunkOverlap
      ) {
        const [text, length] = lastChunk[lastIndex];
        currentChunkLength += length;
        currentChunk.unshift([text, length]);
        lastIndex -= 1;
      }
    };

    while (splits.length > 0) {
      const curSplit = splits[0];
      if (curSplit.tokenSize > chunkSize) {
        throw new Error("Single token exceeded chunk size");
      }
      if (currentChunkLength + curSplit.tokenSize > chunkSize && !newChunk) {
        closeChunk();
      } else {
        if (
          curSplit.isSentence ||
          currentChunkLength + curSplit.tokenSize <= chunkSize ||
          newChunk
        ) {
          currentChunkLength += curSplit.tokenSize;
          currentChunk.push([curSplit.text, curSplit.tokenSize]);
          splits.shift();
          newChunk = false;
        } else {
          closeChunk();
        }
      }
    }

    // Handle the last chunk
    if (!newChunk) {
      chunks.push(currentChunk.map(([text]) => text).join(""));
    }

    return this.#postprocessChunks(chunks);
  }

  /**
   * Remove whitespace only chunks and remove leading and trailing whitespace.
   */
  #postprocessChunks(chunks: string[]): string[] {
    const newChunks: string[] = [];
    for (const chunk of chunks) {
      const trimmedChunk = chunk.trim();
      if (trimmedChunk !== "") {
        newChunks.push(trimmedChunk);
      }
    }
    return newChunks;
  }

  tokenSize = (text: string) => this.#tokenizer.encode(text).length;
}
