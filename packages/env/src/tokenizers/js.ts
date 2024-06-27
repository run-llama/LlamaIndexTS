// Note: js-tiktoken it's 60x slower than the WASM implementation - use it only for unsupported environments
import { getEncoding } from "js-tiktoken";
import type { Tokenizer } from "./types.js";
import { Tokenizers } from "./types.js";

class TokenizerSingleton {
  private defaultTokenizer: Tokenizer;

  constructor() {
    const encoding = getEncoding("cl100k_base");

    this.defaultTokenizer = {
      encode: (text: string) => {
        return new Uint32Array(encoding.encode(text));
      },
      decode: (tokens: Uint32Array) => {
        const numberArray = Array.from(tokens);
        const text = encoding.decode(numberArray);
        const uint8Array = new TextEncoder().encode(text);
        return new TextDecoder().decode(uint8Array);
      },
    };
  }

  tokenizer(encoding?: Tokenizers): Tokenizer {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.defaultTokenizer;
  }
}

export const tokenizers: TokenizerSingleton = new TokenizerSingleton();
export { Tokenizers, type Tokenizer };
