// Note: don't use js-tiktoken it's 60x slower than the WASM implementation
import cl100k_base from "tiktoken/encoders/cl100k_base.json";
import { Tiktoken } from "tiktoken/lite";

export enum Tokenizers {
  CL100K_BASE = "cl100k_base",
}

/**
 * @internal Helper class singleton
 */
class GlobalsHelper {
  defaultTokenizer: {
    encode: (text: string) => Uint32Array;
    decode: (tokens: Uint32Array) => string;
  };

  constructor() {
    const encoding = new Tiktoken(
      cl100k_base.bpe_ranks,
      cl100k_base.special_tokens,
      cl100k_base.pat_str,
    );

    this.defaultTokenizer = {
      encode: (text: string) => {
        return new Uint32Array(encoding.encode(text));
      },
      decode: (tokens: Uint32Array) => {
        const text = encoding.decode(tokens);
        return new TextDecoder().decode(text);
      },
    };
  }

  tokenizer(encoding?: Tokenizers) {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.defaultTokenizer!.encode.bind(this.defaultTokenizer);
  }

  tokenizerDecoder(encoding?: Tokenizers) {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.defaultTokenizer!.decode.bind(this.defaultTokenizer);
  }
}

export function truncateMaxTokens(
  tokenizer: Tokenizers,
  value: string,
  maxTokens: number,
): string {
  // the maximum number of tokens per one character is 2 (e.g. 爨)
  if (value.length * 2 < maxTokens) return value;
  const encoder = globalsHelper.tokenizer(tokenizer);
  let tokens = encoder(value);
  if (tokens.length > maxTokens) {
    // truncate tokens
    tokens = tokens.slice(0, maxTokens);
    const decoder = globalsHelper.tokenizerDecoder(tokenizer);
    value = decoder(tokens);
    // if we truncate at an UTF-8 boundary (some characters have more than one token), tiktoken returns a � character - remove it
    return value.replace("�", "");
  }
  return value;
}

export const globalsHelper = new GlobalsHelper();
