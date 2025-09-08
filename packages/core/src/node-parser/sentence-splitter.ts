import { consoleLogger, type Logger } from "@llamaindex/env";
import type { Tokenizer } from "@llamaindex/env/tokenizers";
import { Settings } from "../global";

import { MetadataAwareTextSplitter } from "./base";
import type { SplitterParams } from "./type";
import {
  splitByChar,
  splitByRegex,
  splitBySentenceTokenizer,
  splitBySep,
  type TextSplitterFn,
} from "./utils";

export type SentenceSplitterOptions = {
  chunkSize: number;
  chunkOverlap: number;
  separator: string;
  paragraphSeparator: string;
  secondaryChunkingRegex: string;
  extraAbbreviations: string[];
};

type _Split = [string, boolean, number]; // [text, isSentence, tokenSize]

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
  /**
   * Extra abbreviations to consider while splitting into sentences.
   * For example, for contracts, you may want to consider "LLC." as an important abbreviation
   */
  extraAbbreviations: string[] | undefined = [];

  #chunkingTokenizerFn = splitBySentenceTokenizer();
  #splitFns: Set<TextSplitterFn> = new Set();
  #subSentenceSplitFns: Set<TextSplitterFn> = new Set();
  #tokenizer: Tokenizer;
  #logger: Logger;

  constructor(
    params?: Partial<SentenceSplitterOptions> &
      SplitterParams & { logger?: Logger },
  ) {
    super();
    if (params) {
      const parsedParams = this.parseSentenceSplitterParams(params);
      this.chunkSize = parsedParams.chunkSize!;
      this.chunkOverlap = parsedParams.chunkOverlap!;
      this.separator = parsedParams.separator!;
      this.paragraphSeparator = parsedParams.paragraphSeparator!;
      this.secondaryChunkingRegex = parsedParams.secondaryChunkingRegex!;
      this.extraAbbreviations = parsedParams.extraAbbreviations!;
    }
    this.#chunkingTokenizerFn = splitBySentenceTokenizer(
      this.extraAbbreviations,
    );
    this.#tokenizer = params?.tokenizer ?? Settings.tokenizer;
    this.#logger = params?.logger ?? consoleLogger;
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
      this.#logger.log(
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

  *#split(
    text: string,
    chunkSize: number,
    tokenSize?: number,
  ): Generator<_Split> {
    const _tokenSize = tokenSize ?? this.tokenSize(text);
    if (_tokenSize <= chunkSize) {
      yield [text, true, _tokenSize];
      return;
    }
    const [textSplitsByFns, isSentence] = this.#getSplitsByFns(text);

    for (const textSplit of textSplitsByFns) {
      const textSplitTokenSize = this.tokenSize(textSplit);
      if (textSplitTokenSize <= chunkSize) {
        yield [textSplit, isSentence, textSplitTokenSize];
      } else {
        yield* this.#split(textSplit, chunkSize, textSplitTokenSize);
      }
    }
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

  #merge(splits: Iterable<_Split>, chunkSize: number): string[] {
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
        currentChunkLength + lastChunk[lastIndex]![1] <= this.chunkOverlap
      ) {
        const [text, length] = lastChunk[lastIndex]!;
        currentChunkLength += length;
        currentChunk.unshift([text, length]);
        lastIndex -= 1;
      }
    };

    const splitsIterator = splits[Symbol.iterator]();
    let currentSplitResult = splitsIterator.next();

    while (!currentSplitResult.done) {
      const [text, isSentence, tokenSize] = currentSplitResult.value;
      if (tokenSize > chunkSize) {
        throw new Error("Single token exceeded chunk size");
      }
      if (currentChunkLength + tokenSize > chunkSize && !newChunk) {
        closeChunk();
      } else {
        if (
          isSentence ||
          currentChunkLength + tokenSize <= chunkSize ||
          newChunk
        ) {
          currentChunkLength += tokenSize;
          currentChunk.push([text, tokenSize]);
          newChunk = false;
          currentSplitResult = splitsIterator.next();
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

  private parseSentenceSplitterParams(
    params: Partial<SentenceSplitterOptions> = {},
  ): SentenceSplitterOptions {
    const options: SentenceSplitterOptions = {
      chunkSize: params.chunkSize ?? 1024,
      chunkOverlap: params.chunkOverlap ?? 200,
      separator: params.separator ?? " ",
      paragraphSeparator: params.paragraphSeparator ?? "\n\n\n",
      secondaryChunkingRegex:
        params.secondaryChunkingRegex ?? "[^,.;。？！]+[,.;。？！]?",
      extraAbbreviations: params.extraAbbreviations ?? [],
    };

    // type guards
    if (typeof options.chunkSize !== "number") {
      throw new Error("chunkSize must be a number");
    }
    if (typeof options.chunkOverlap !== "number") {
      throw new Error("chunkOverlap must be a number");
    }
    if (typeof options.separator !== "string") {
      throw new Error("separator must be a string.");
    }
    if (typeof options.paragraphSeparator !== "string") {
      throw new Error("paragraphSeparator must be a string.");
    }
    if (typeof options.secondaryChunkingRegex !== "string") {
      throw new Error("secondaryChunkingRegex must be a string.");
    }
    if (!Array.isArray(options.extraAbbreviations)) {
      throw new Error("extraAbbreviations must be an array.");
    }

    // validations
    if (options.chunkSize <= 0) {
      throw new Error("chunkSize must be greater than 0.");
    }
    if (options.chunkOverlap < 0) {
      throw new Error("chunkOverlap must be >= 0.");
    }
    if (options.chunkOverlap >= options.chunkSize) {
      throw new Error("chunkOverlap must be less than chunk size.");
    }

    return options;
  }
}
