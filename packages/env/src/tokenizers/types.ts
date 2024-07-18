export enum Tokenizers {
  CL100K_BASE = "cl100k_base",
}

export interface Tokenizer {
  encode: (text: string) => Uint32Array;
  decode: (tokens: Uint32Array) => string;
}
