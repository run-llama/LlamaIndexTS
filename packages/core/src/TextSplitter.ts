import nlp from "compromise";
import { EOL } from "node:os";
// GitHub translated
import { globalsHelper } from "./GlobalsHelper";
import { DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE } from "./constants";

class TextSplit {
  textChunk: string;
  numCharOverlap: number | undefined;

  constructor(
    textChunk: string,
    numCharOverlap: number | undefined = undefined,
  ) {
    this.textChunk = textChunk;
    this.numCharOverlap = numCharOverlap;
  }
}

type SplitRep = { text: string; numTokens: number };

export const defaultSentenceTokenizer = (text: string): string[] => {
  return nlp(text)
    .sentences()
    .json()
    .map((sentence: any) => sentence.text);
};

// Refs: https://github.com/fxsjy/jieba/issues/575#issuecomment-359637511
const resentencesp =
  /([﹒﹔﹖﹗．；。！？]["’”」』]{0,2}|：(?=["‘“「『]{1,2}|$))/;
/**
 * Tokenizes sentences. Suitable for Chinese, Japanese, and Korean. Use instead of `defaultSentenceTokenizer`.
 * @param text
 * @returns string[]
 */
export function cjkSentenceTokenizer(sentence: string): string[] {
  const slist = [];
  const parts = sentence.split(resentencesp);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (resentencesp.test(part) && slist.length > 0) {
      slist[slist.length - 1] += part;
    } else if (part) {
      slist.push(part);
    }
  }

  return slist.filter((s) => s.length > 0);
}

export const defaultParagraphSeparator = EOL + EOL + EOL;

// In theory there's also Mac style \r only, but it's pre-OSX and I don't think
// many documents will use it.

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
  private chunkingTokenizerFn: (text: string) => string[];
  private splitLongSentences: boolean;

  constructor(options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    tokenizer?: any;
    tokenizerDecoder?: any;
    paragraphSeparator?: string;
    chunkingTokenizerFn?: (text: string) => string[];
    splitLongSentences?: boolean;
  }) {
    const {
      chunkSize = DEFAULT_CHUNK_SIZE,
      chunkOverlap = DEFAULT_CHUNK_OVERLAP,
      tokenizer = null,
      tokenizerDecoder = null,
      paragraphSeparator = defaultParagraphSeparator,
      chunkingTokenizerFn,
      splitLongSentences = false,
    } = options ?? {};

    if (chunkOverlap > chunkSize) {
      throw new Error(
        `Got a larger chunk overlap (${chunkOverlap}) than chunk size (${chunkSize}), should be smaller.`,
      );
    }
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    // this._callback_manager = callback_manager || new CallbackManager([]);

    this.tokenizer = tokenizer ?? globalsHelper.tokenizer();
    this.tokenizerDecoder =
      tokenizerDecoder ?? globalsHelper.tokenizerDecoder();

    this.paragraphSeparator = paragraphSeparator;
    this.chunkingTokenizerFn = chunkingTokenizerFn ?? defaultSentenceTokenizer;
    this.splitLongSentences = splitLongSentences;
  }

  private getEffectiveChunkSize(extraInfoStr?: string): number {
    // get "effective" chunk size by removing the metadata
    let effectiveChunkSize;
    if (extraInfoStr != undefined) {
      const numExtraTokens = this.tokenizer(`${extraInfoStr}\n\n`).length + 1;
      effectiveChunkSize = this.chunkSize - numExtraTokens;
      if (effectiveChunkSize <= 0) {
        throw new Error(
          "Effective chunk size is non positive after considering extra_info",
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
      const sentenceSplits = this.chunkingTokenizerFn(parText);

      if (!sentenceSplits) {
        continue;
      }

      for (const sentence_split of sentenceSplits) {
        splits.push(sentence_split.trim());
      }
    }
    return splits;
  }

  /**
   * Splits sentences into chunks if necessary.
   *
   * This isn't great behavior because it can split down the middle of a
   * word or in non-English split down the middle of a Unicode codepoint
   * so the splitting is turned off by default. If you need it, please
   * set the splitLongSentences option to true.
   * @param sentenceSplits
   * @param effectiveChunkSize
   * @returns
   */
  private processSentenceSplits(
    sentenceSplits: string[],
    effectiveChunkSize: number,
  ): SplitRep[] {
    if (!this.splitLongSentences) {
      return sentenceSplits.map((split) => ({
        text: split,
        numTokens: this.tokenizer(split).length,
      }));
    }

    let newSplits: SplitRep[] = [];
    for (const split of sentenceSplits) {
      let splitTokens = this.tokenizer(split);
      const splitLen = splitTokens.length;
      if (splitLen <= effectiveChunkSize) {
        newSplits.push({ text: split, numTokens: splitLen });
      } else {
        for (let i = 0; i < splitLen; i += effectiveChunkSize) {
          const cur_split = this.tokenizerDecoder(
            splitTokens.slice(i, i + effectiveChunkSize),
          );
          newSplits.push({ text: cur_split, numTokens: effectiveChunkSize });
        }
      }
    }
    return newSplits;
  }

  combineTextSplits(
    newSentenceSplits: SplitRep[],
    effectiveChunkSize: number,
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
        if (curChunkSentences.length > 0) {
          // push curent doc list to docs
          docs.push(
            new TextSplit(
              curChunkSentences
                .map((sentence) => sentence.text)
                .join(" ")
                .trim(),
            ),
          );
        }

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
          .trim(),
      ),
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
      effectiveChunkSize,
    );

    // combine sentence splits into chunks of text that can then be returned
    let combinedTextSplits = this.combineTextSplits(
      newSentenceSplits,
      effectiveChunkSize,
    );

    return combinedTextSplits;
  }

  splitText(text: string, extraInfoStr?: string): string[] {
    const text_splits = this.splitTextWithOverlaps(text);
    const chunks = text_splits.map((text_split) => text_split.textChunk);
    return chunks;
  }
}
