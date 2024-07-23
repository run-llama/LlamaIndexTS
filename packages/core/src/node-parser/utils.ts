import { SentenceTokenizerNew } from "natural/lib/natural/tokenizers";
import type { TextSplitter } from "./base";

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

export const splitBySentenceTokenizer = (): TextSplitterFn => {
  return (text: string) => {
    const tokenizer = new SentenceTokenizerNew();
    return tokenizer.tokenize(text);
  };
};

export const splitByRegex = (regex: string): TextSplitterFn => {
  return (text: string) => text.match(new RegExp(regex, "g")) || [];
};

export const splitByPhraseRegex = (): TextSplitterFn => {
  const regex = "[^,.;]+[,.;]?";
  return splitByRegex(regex);
};
