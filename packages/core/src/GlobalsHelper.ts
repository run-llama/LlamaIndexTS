import { encodingForModel } from "js-tiktoken";

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
    const encoding = encodingForModel("text-embedding-ada-002"); // cl100k_base

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

export const globalsHelper = new GlobalsHelper();
