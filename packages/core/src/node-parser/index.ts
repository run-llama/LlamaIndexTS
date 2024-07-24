/**
 * Current logic is based on the following implementation:
 * @link @link https://github.com/run-llama/llama_index/blob/cc0ea90e7e72b8e4f5069aac981d56bb1d568323/llama-index-core/llama_index/core/node_parser
 */
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
