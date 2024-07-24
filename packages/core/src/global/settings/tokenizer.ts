import { AsyncLocalStorage, type Tokenizer, tokenizers } from "@llamaindex/env";

const chunkSizeAsyncLocalStorage = new AsyncLocalStorage<Tokenizer>();
let globalTokenizer: Tokenizer = tokenizers.tokenizer();

export function getTokenizer(): Tokenizer {
  return globalTokenizer ?? chunkSizeAsyncLocalStorage.getStore();
}

export function setTokenizer(tokenizer: Tokenizer | undefined) {
  if (tokenizer !== undefined) {
    globalTokenizer = tokenizer;
  }
}

export function withTokenizer<Result>(
  tokenizer: Tokenizer,
  fn: () => Result,
): Result {
  return chunkSizeAsyncLocalStorage.run(tokenizer, fn);
}
