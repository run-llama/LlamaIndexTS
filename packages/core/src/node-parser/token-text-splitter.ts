import { consoleLogger, type Logger } from "@llamaindex/env";
import type { Tokenizer } from "@llamaindex/env/tokenizers";
import { DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE, Settings } from "../global";
import { parseSchema, z, type Zod } from "../schema";
import { MetadataAwareTextSplitter } from "./base";
import type { SplitterParams } from "./type";
import { splitByChar, splitBySep } from "./utils";

const DEFAULT_METADATA_FORMAT_LEN = 2;

const tokenTextSplitterSchema = z.object({
  chunkSize: z.number().positive().default(DEFAULT_CHUNK_SIZE),
  chunkOverlap: z.number().nonnegative().default(DEFAULT_CHUNK_OVERLAP),
  separator: z.string().default(" "),
  backupSeparators: z.array(z.string()).default(["\n"]),
});

export class TokenTextSplitter extends MetadataAwareTextSplitter {
  chunkSize: number = DEFAULT_CHUNK_SIZE;
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP;
  separator: string = " ";
  backupSeparators: string[] = ["\n"];
  #tokenizer: Tokenizer;
  #splitFns: Array<(text: string) => string[]> = [];
  #logger: Logger;

  constructor(
    params?: SplitterParams &
      Partial<Zod.input<typeof tokenTextSplitterSchema>> & { logger?: Logger },
  ) {
    super();

    if (params) {
      const parsedParams = parseSchema(tokenTextSplitterSchema, params);
      this.chunkSize = parsedParams.chunkSize!;
      this.chunkOverlap = parsedParams.chunkOverlap!;
      this.separator = parsedParams.separator!;
      this.backupSeparators = parsedParams.backupSeparators!;
    }

    if (this.chunkOverlap > this.chunkSize) {
      throw new Error(
        `Got a larger chunk overlap (${this.chunkOverlap}) than chunk size (${this.chunkSize}), should be smaller.`,
      );
    }

    this.#tokenizer = params?.tokenizer ?? Settings.tokenizer;
    this.#logger = params?.logger ?? consoleLogger;

    const allSeparators = [this.separator, ...this.backupSeparators];
    this.#splitFns = allSeparators.map((sep) => splitBySep(sep));
    this.#splitFns.push(splitByChar());
  }

  /**
   * Split text into chunks, reserving space required for metadata string.
   * @param text The text to split.
   * @param metadata The metadata string.
   * @returns An array of text chunks.
   */
  splitTextMetadataAware(text: string, metadata: string): string[] {
    const metadataLength =
      this.tokenSize(metadata) + DEFAULT_METADATA_FORMAT_LEN;
    const effectiveChunkSize = this.chunkSize - metadataLength;

    if (effectiveChunkSize <= 0) {
      throw new Error(
        `Metadata length (${metadataLength}) is longer than chunk size (${this.chunkSize}). ` +
          `Consider increasing the chunk size or decreasing the size of your metadata to avoid this.`,
      );
    } else if (effectiveChunkSize < 50) {
      this.#logger.warn(
        `Metadata length (${metadataLength}) is close to chunk size (${this.chunkSize}). ` +
          `Resulting chunks are less than 50 tokens. Consider increasing the chunk size or decreasing the size of your metadata to avoid this.`,
      );
    }

    return this._splitText(text, effectiveChunkSize);
  }

  /**
   * Split text into chunks.
   * @param text The text to split.
   * @returns An array of text chunks.
   */
  splitText(text: string): string[] {
    return this._splitText(text, this.chunkSize);
  }

  /**
   * Internal method to split text into chunks up to a specified size.
   * @param text The text to split.
   * @param chunkSize The maximum size of each chunk.
   * @returns An array of text chunks.
   */
  private _splitText(text: string, chunkSize: number): string[] {
    if (text === "") return [text];

    // Dispatch chunking start event
    Settings.callbackManager.dispatchEvent("chunking-start", { text: [text] });

    const splits = this._split(text, chunkSize);
    const chunks = this._merge(splits, chunkSize);

    Settings.callbackManager.dispatchEvent("chunking-end", { chunks });

    return chunks;
  }

  /**
   * Break text into splits that are smaller than the chunk size.
   * @param text The text to split.
   * @param chunkSize The maximum size of each split.
   * @returns An array of text splits.
   */
  private _split(text: string, chunkSize: number): string[] {
    if (this.tokenSize(text) <= chunkSize) {
      return [text];
    }

    for (const splitFn of this.#splitFns) {
      const splits = splitFn(text);
      if (splits.length > 1) {
        const newSplits: string[] = [];
        for (const split of splits) {
          const splitLen = this.tokenSize(split);
          if (splitLen <= chunkSize) {
            newSplits.push(split);
          } else {
            newSplits.push(...this._split(split, chunkSize));
          }
        }
        return newSplits;
      }
    }

    return [text];
  }

  /**
   * Merge splits into chunks with overlap.
   * @param splits The array of text splits.
   * @param chunkSize The maximum size of each chunk.
   * @returns An array of merged text chunks.
   */
  private _merge(splits: string[], chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const split of splits) {
      const splitLength = this.tokenSize(split);

      if (splitLength > chunkSize) {
        this.#logger.warn(
          `Got a split of size ${splitLength}, larger than chunk size ${chunkSize}.`,
        );
      }

      if (currentLength + splitLength > chunkSize) {
        const chunk = currentChunk.join("").trim();
        if (chunk) {
          chunks.push(chunk);
        }

        currentChunk = [];
        currentLength = 0;

        const overlapTokens = this.chunkOverlap;
        const overlapSplits: string[] = [];

        let overlapLength = 0;
        while (
          overlapSplits.length < splits.length &&
          overlapLength < overlapTokens
        ) {
          const overlapSplit = currentChunk.shift();
          if (!overlapSplit) break;
          overlapSplits.push(overlapSplit);
          overlapLength += this.tokenSize(overlapSplit);
        }

        for (const overlapSplit of overlapSplits.reverse()) {
          currentChunk.push(overlapSplit);
          currentLength += this.tokenSize(overlapSplit);
          if (currentLength >= overlapTokens) break;
        }
      }

      currentChunk.push(split);
      currentLength += splitLength;
    }

    const finalChunk = currentChunk.join("").trim();
    if (finalChunk) {
      chunks.push(finalChunk);
    }

    return chunks;
  }

  /**
   * Calculate the number of tokens in the text using the tokenizer.
   * @param text The text to tokenize.
   * @returns The number of tokens.
   */
  private tokenSize(text: string): number {
    return this.#tokenizer.encode(text).length;
  }
}
