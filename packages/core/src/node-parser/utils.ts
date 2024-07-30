import type { TextSplitter } from "./base";
import SentenceTokenizerNew from "./sentence-tokenizer-parser.js";

export type TextSplitterFn = (text: string) => string[];

const truncateText = (text: string, textSplitter: TextSplitter): string => {
  const chunks = textSplitter.splitText(text);
  return chunks[0];
};

const splitTextKeepSeparator = (text: string, separator: string): string[] => {
  const parts = text.split(separator);
  const result = parts.map((part, index) =>
    index > 0 ? separator + part : part,
  );
  return result.filter((s) => s);
};

export const splitBySep = (
  sep: string,
  keepSep: boolean = true,
): TextSplitterFn => {
  if (keepSep) {
    return (text: string) => splitTextKeepSeparator(text, sep);
  } else {
    return (text: string) => text.split(sep);
  }
};

export const splitByChar = (): TextSplitterFn => {
  return (text: string) => text.split("");
};

let sentenceTokenizer: SentenceTokenizerNew | null = null;

export const splitBySentenceTokenizer = (): TextSplitterFn => {
  if (!sentenceTokenizer) {
    sentenceTokenizer = new SentenceTokenizerNew();
  }
  const tokenizer = sentenceTokenizer;
  return (text: string) => {
    try {
      return tokenizer.tokenize(text);
    } catch (e) {
      console.warn(`Can't use sentence tokenizer to split '${text}'`, e);
      return [text];
    }
  };
};

export const splitByRegex = (regex: string): TextSplitterFn => {
  return (text: string) => text.match(new RegExp(regex, "g")) || [];
};

export const splitByPhraseRegex = (): TextSplitterFn => {
  const regex = "[^,.;]+[,.;]?";
  return splitByRegex(regex);
};
