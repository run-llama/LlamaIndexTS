import { SentenceSplitter } from "./sentence-splitter";

/**
 * @deprecated Use `SentenceSplitter` instead
 */
export const SimpleNodeParser = SentenceSplitter;

export { MetadataAwareTextSplitter, NodeParser, TextSplitter } from "./base";
export { MarkdownNodeParser } from "./markdown";
export { SentenceSplitter } from "./sentence-splitter";
export { SentenceWindowNodeParser } from "./sentence-window";
export type { SplitterParams } from "./type";
export {
  splitByChar,
  splitByPhraseRegex,
  splitByRegex,
  splitBySentenceTokenizer,
  splitBySep,
} from "./utils";
export type { TextSplitterFn } from "./utils";
