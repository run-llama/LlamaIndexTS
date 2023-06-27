class GlobalsHelper {
  tokenizer() {
    const tiktoken = require("tiktoken-node");
    let enc = new tiktoken.getEncoding("gpt2");
    const defaultTokenizer = (text: string) => {
      return enc.encode(text);
    };
    return defaultTokenizer;
  }
}

export const globalsHelper = new GlobalsHelper();
