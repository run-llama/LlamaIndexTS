declare class SentenceTokenizer {
  constructor(abbreviations?: string[]);
  tokenize(text: string): string[];
}

export { SentenceTokenizer as default };
