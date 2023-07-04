class GlobalsHelper {
  defaultTokenizer: ((text: string) => string[]) | null = null;

  tokenizer() {
    if (this.defaultTokenizer) {
      return this.defaultTokenizer;
    }

    const tiktoken = require("tiktoken-node");
    let enc = new tiktoken.getEncoding("gpt2");
    this.defaultTokenizer = (text: string) => {
      return enc.encode(text);
    };
    return this.defaultTokenizer;
  }
}

export const globalsHelper = new GlobalsHelper();
