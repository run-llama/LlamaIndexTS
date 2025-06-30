import { abbreviations } from "./abbreviations";
import type { TextSplitter } from "./base";
import SentenceTokenizer from "./sentence_tokenizer";

export type TextSplitterFn = (text: string) => string[];

export const truncateText = (
  text: string,
  textSplitter: TextSplitter,
): string => {
  const chunks = textSplitter.splitText(text);
  return chunks[0] ?? text;
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

export const splitBySentenceTokenizer = (
  extraAbbreviations: string[] | undefined = [],
): TextSplitterFn => {
  const tokenizer = new SentenceTokenizer(
    [
      ...abbreviations.english,
      ...abbreviations.spanish,
      // Add the extra abbreviations provided by the user, e.g. for business-specific context
      ...extraAbbreviations,
    ],
    false,
  );
  return (text: string) => {
    try {
      return tokenizer.tokenize(text);
    } catch {
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
