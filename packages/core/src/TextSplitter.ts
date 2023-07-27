// GitHub translated

import { globalsHelper } from "./GlobalsHelper";
import { DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP } from "./constants";

class TextSplit {
  textChunk: string;
  numCharOverlap: number | undefined;

  constructor(
    textChunk: string,
    numCharOverlap: number | undefined = undefined
  ) {
    this.textChunk = textChunk;
    this.numCharOverlap = numCharOverlap;
  }
}

type SplitRep = { text: string; numTokens: number };

/**
 * SentenceSplitter is our default text splitter that supports splitting into sentences, paragraphs, or fixed length chunks with overlap.
 *
 * One of the advantages of SentenceSplitter is that even in the fixed length chunks it will try to keep sentences together.
 */
export class SentenceSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private tokenizer: any;
  private tokenizerDecoder: any;
  private paragraphSeparator: string;
  private chunkingTokenizerFn: any;
  // private _callback_manager: any;

  constructor(
    chunkSize: number = DEFAULT_CHUNK_SIZE,
    chunkOverlap: number = DEFAULT_CHUNK_OVERLAP,
    tokenizer: any = null,
    tokenizerDecoder: any = null,
    paragraphSeparator: string = "\n\n\n",
    chunkingTokenizerFn: any = undefined
    // callback_manager: any = undefined
  ) {
    if (chunkOverlap > chunkSize) {
      throw new Error(
        `Got a larger chunk overlap (${chunkOverlap}) than chunk size (${chunkSize}), should be smaller.`
      );
    }
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    // this._callback_manager = callback_manager || new CallbackManager([]);

    if (chunkingTokenizerFn == undefined) {
      // define a callable mapping a string to a list of strings
      const defaultChunkingTokenizerFn = (text: string) => {
        var result = text.match(/[^.?!]+[.!?]+[\])'"`’”]*|.+/g);
        return result;
      };

      chunkingTokenizerFn = defaultChunkingTokenizerFn;
    }

    if (tokenizer == undefined || tokenizerDecoder == undefined) {
      tokenizer = globalsHelper.tokenizer();
      tokenizerDecoder = globalsHelper.tokenizerDecoder();
    }
    this.tokenizer = tokenizer;
    this.tokenizerDecoder = tokenizerDecoder;

    this.paragraphSeparator = paragraphSeparator;
    this.chunkingTokenizerFn = chunkingTokenizerFn;
  }

  private getEffectiveChunkSize(extraInfoStr?: string): number {
    // get "effective" chunk size by removing the metadata
    let effectiveChunkSize;
    if (extraInfoStr != undefined) {
      const numExtraTokens = this.tokenizer(`${extraInfoStr}\n\n`).length + 1;
      effectiveChunkSize = this.chunkSize - numExtraTokens;
      if (effectiveChunkSize <= 0) {
        throw new Error(
          "Effective chunk size is non positive after considering extra_info"
        );
      }
    } else {
      effectiveChunkSize = this.chunkSize;
    }
    return effectiveChunkSize;
  }

  getParagraphSplits(text: string, effectiveChunkSize?: number): string[] {
    // get paragraph splits
    let paragraphSplits: string[] = text.split(this.paragraphSeparator);
    let idx = 0;
    if (effectiveChunkSize == undefined) {
      return paragraphSplits;
    }

    // merge paragraphs that are too small
    while (idx < paragraphSplits.length) {
      if (
        idx < paragraphSplits.length - 1 &&
        paragraphSplits[idx].length < effectiveChunkSize
      ) {
        paragraphSplits[idx] = [
          paragraphSplits[idx],
          paragraphSplits[idx + 1],
        ].join(this.paragraphSeparator);
        paragraphSplits.splice(idx + 1, 1);
      } else {
        idx += 1;
      }
    }
    return paragraphSplits;
  }

  getSentenceSplits(text: string, effectiveChunkSize?: number): string[] {
    let paragraphSplits = this.getParagraphSplits(text, effectiveChunkSize);
    // Next we split the text using the chunk tokenizer fn/
    let splits = [];
    for (const parText of paragraphSplits) {
      let sentenceSplits = this.chunkingTokenizerFn(parText);
      for (const sentence_split of sentenceSplits) {
        splits.push(sentence_split.trim());
      }
    }
    return splits;
  }

  private processSentenceSplits(
    sentenceSplits: string[],
    effectiveChunkSize: number
  ): SplitRep[] {
    // Process sentence splits
    // Primarily check if any sentences exceed the chunk size. If they don't,
    // force split by tokenizer
    let newSplits: SplitRep[] = [];
    for (const split of sentenceSplits) {
      let splitTokens = this.tokenizer(split);
      const splitLen = splitTokens.length;
      if (splitLen <= effectiveChunkSize) {
        newSplits.push({ text: split, numTokens: splitLen });
      } else {
        for (let i = 0; i < splitLen; i += effectiveChunkSize) {
          const cur_split = this.tokenizerDecoder(
            splitTokens.slice(i, i + effectiveChunkSize)
          );
          newSplits.push({ text: cur_split, numTokens: effectiveChunkSize });
        }
      }
    }
    return newSplits;
  }

  combineTextSplits(
    newSentenceSplits: SplitRep[],
    effectiveChunkSize: number
  ): TextSplit[] {
    // go through sentence splits, combine to chunks that are within the chunk size

    // docs represents final list of text chunks
    let docs: TextSplit[] = [];
    // curChunkSentences represents the current list of sentence splits (that)
    // will be merged into a chunk
    let curChunkSentences: SplitRep[] = [];
    let curChunkTokens = 0;

    for (let i = 0; i < newSentenceSplits.length; i++) {
      // if adding newSentenceSplits[i] to curDocBuffer would exceed effectiveChunkSize,
      // then we need to add the current curDocBuffer to docs
      if (
        curChunkTokens + newSentenceSplits[i].numTokens >
        effectiveChunkSize
      ) {
        // push curent doc list to docs
        docs.push(
          new TextSplit(
            curChunkSentences
              .map((sentence) => sentence.text)
              .join(" ")
              .trim()
          )
        );

        const lastChunkSentences = curChunkSentences;

        // reset docs list
        curChunkTokens = 0;
        curChunkSentences = [];

        // add the last sentences from the last chunk until we've hit the overlap
        // do it in reverse order
        for (let j = lastChunkSentences.length - 1; j >= 0; j--) {
          if (
            curChunkTokens + lastChunkSentences[j].numTokens >
            this.chunkOverlap
          ) {
            break;
          }
          curChunkSentences.unshift(lastChunkSentences[j]);
          curChunkTokens += lastChunkSentences[j].numTokens + 1;
        }
      }

      curChunkSentences.push(newSentenceSplits[i]);
      curChunkTokens += newSentenceSplits[i].numTokens + 1;
    }
    docs.push(
      new TextSplit(
        curChunkSentences
          .map((sentence) => sentence.text)
          .join(" ")
          .trim()
      )
    );
    return docs;
  }

  splitTextWithOverlaps(text: string, extraInfoStr?: string): TextSplit[] {
    // Split incoming text and return chunks with overlap size.
    // Has a preference for complete sentences, phrases, and minimal overlap.

    // here is the typescript code (skip callback manager)
    if (text == "") {
      return [];
    }

    let effectiveChunkSize = this.getEffectiveChunkSize(extraInfoStr);
    let sentenceSplits = this.getSentenceSplits(text, effectiveChunkSize);

    // Check if any sentences exceed the chunk size. If they don't,
    // force split by tokenizer
    let newSentenceSplits = this.processSentenceSplits(
      sentenceSplits,
      effectiveChunkSize
    );

    // combine sentence splits into chunks of text that can then be returned
    let combinedTextSplits = this.combineTextSplits(
      newSentenceSplits,
      effectiveChunkSize
    );

    return combinedTextSplits;
  }

  splitText(text: string, extraInfoStr?: string): string[] {
    const text_splits = this.splitTextWithOverlaps(text);
    const chunks = text_splits.map((text_split) => text_split.textChunk);
    return chunks;
  }
}
