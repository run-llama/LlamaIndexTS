import type { TextSplitter } from "./type";

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
    const spans = void 0 as any; // todo
    const sentences = [];
    for (let i = 0; i < spans.length; i++) {
      const start = spans[i][0];
      const end = i < spans.length - 1 ? spans[i + 1][0] : text.length;
      sentences.push(text.substring(start, end));
    }
    return sentences;
  };
};

export const splitByRegex = (regex: string): TextSplitterFn => {
  return (text: string) => text.match(new RegExp(regex, "g")) || [];
};

export const splitByPhraseRegex = (): TextSplitterFn => {
  const regex = "[^,.;]+[,.;]?";
  return splitByRegex(regex);
};
