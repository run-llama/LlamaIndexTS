import { Event, EventTag, EventType } from "./callbacks/CallbackManager";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper class singleton
 */
class GlobalsHelper {
  defaultTokenizer: {
    encode: (text: string) => number[];
    decode: (tokens: number[]) => string;
  } | null = null;

  tokenizer() {
    if (!this.defaultTokenizer) {
      const tiktoken = require("tiktoken-node");
      this.defaultTokenizer = tiktoken.getEncoding("gpt2");
    }

    return this.defaultTokenizer!.encode.bind(this.defaultTokenizer);
  }

  tokenizerDecoder() {
    if (!this.defaultTokenizer) {
      const tiktoken = require("tiktoken-node");
      this.defaultTokenizer = tiktoken.getEncoding("gpt2");
    }

    return this.defaultTokenizer!.decode.bind(this.defaultTokenizer);
  }

  createEvent({
    parentEvent,
    type,
    tags,
  }: {
    parentEvent?: Event;
    type: EventType;
    tags?: EventTag[];
  }): Event {
    return {
      id: uuidv4(),
      type,
      // inherit parent tags if tags not set
      tags: tags || parentEvent?.tags,
      parentId: parentEvent?.id,
    };
  }
}

export const globalsHelper = new GlobalsHelper();
