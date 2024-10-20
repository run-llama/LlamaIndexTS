// Note: This is using th WASM implementation of tiktoken which is 60x faster
import type { Tokenizer } from "./types.js";
import { Tokenizers } from "./types.js";

import cl100kBase from "gpt-tokenizer";

class TokenizerSingleton {
  #defaultTokenizer: Tokenizer;

  constructor() {
    this.#defaultTokenizer = {
      encode: (text: string): Uint32Array => {
        return new Uint32Array(cl100kBase.encode(text));
      },
      decode: (tokens: Uint32Array) => {
        return cl100kBase.decode(tokens);
      },
    };
  }

  tokenizer(encoding?: Tokenizers): Tokenizer {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.#defaultTokenizer;
  }
}

export const tokenizers: TokenizerSingleton = new TokenizerSingleton();
export { Tokenizers, type Tokenizer };
