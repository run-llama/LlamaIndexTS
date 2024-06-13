import { Tokenizers, tokenizers } from "@llamaindex/env";

export function truncateMaxTokens(
  tokenizer: Tokenizers,
  value: string,
  maxTokens: number,
): string {
  // the maximum number of tokens per one character is 2 (e.g. 爨)
  if (value.length * 2 < maxTokens) return value;
  const t = tokenizers.tokenizer(tokenizer);
  let tokens = t.encode(value);
  if (tokens.length > maxTokens) {
    // truncate tokens
    tokens = tokens.slice(0, maxTokens);
    value = t.decode(tokens);
    // if we truncate at an UTF-8 boundary (some characters have more than one token), tiktoken returns a � character - remove it
    return value.replace("�", "");
  }
  return value;
}
