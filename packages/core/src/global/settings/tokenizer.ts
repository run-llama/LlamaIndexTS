import { AsyncLocalStorage } from "@llamaindex/env";
import { type Tokenizer, tokenizers } from "@llamaindex/env/tokenizers";

const chunkSizeAsyncLocalStorage = new AsyncLocalStorage<Tokenizer>();
let globalTokenizer: Tokenizer = tokenizers.tokenizer();

export function getTokenizer(): Tokenizer {
  return chunkSizeAsyncLocalStorage.getStore() ?? globalTokenizer;
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
