import type { Tokenizer } from "@llamaindex/env/tokenizers";

export type SplitterParams = {
  tokenizer?: Tokenizer;
};

export type PartialWithUndefined<T> = {
  [P in keyof T]?: T[P] | undefined;
};
