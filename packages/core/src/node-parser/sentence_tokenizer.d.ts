declare class SentenceTokenizer {
  constructor(abbreviations?: string[], trimSentences?: boolean);
  tokenize(text: string): string[];
}

export { SentenceTokenizer as default };
