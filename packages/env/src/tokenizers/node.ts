// Note: This is using th WASM implementation of tiktoken which is 60x faster
import type { Tokenizer } from "./types.js";
import { Tokenizers } from "./types.js";

import { get_encoding } from "tiktoken";

class TokenizerSingleton {
  private defaultTokenizer: Tokenizer;

  constructor() {
    const encoding = get_encoding("cl100k_base");

    this.defaultTokenizer = {
      encode: (text: string) => {
        return encoding.encode(text);
      },
      decode: (tokens: Uint32Array) => {
        const text = encoding.decode(tokens);
        return new TextDecoder().decode(text);
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
