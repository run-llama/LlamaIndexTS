import { Trace } from "./callbacks/CallbackManager";
import { v4 as uuidv4 } from "uuid";

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

  createTrace({ parentTrace }: { parentTrace?: Trace }): Trace {
    return {
      id: uuidv4(),
      parentId: parentTrace?.id,
    };
  }
}

export const globalsHelper = new GlobalsHelper();
