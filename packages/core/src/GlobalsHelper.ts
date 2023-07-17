import { Event, EventTag, EventType } from "./callbacks/CallbackManager";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper class singleton
 */
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
