import { getEncoding } from "js-tiktoken";

import { v4 as uuidv4 } from "uuid";
import { Event, EventTag, EventType } from "./callbacks/CallbackManager";

/**
 * Helper class singleton
 */
class GlobalsHelper {
  defaultTokenizer: {
    encode: (text: string) => Uint32Array;
    decode: (tokens: Uint32Array) => string;
  } | null = null;

  private initDefaultTokenizer() {
    const encoding = getEncoding("cl100k_base");

    this.defaultTokenizer = {
      encode: (text: string) => {
        return Uint32Array.from(encoding.encode(text));
      },
      decode: (tokens: Uint32Array) => {
        return encoding.decode(Array.from(tokens));
      },
    };
  }

  tokenizer() {
    if (!this.defaultTokenizer) {
      this.initDefaultTokenizer();
    }

    return this.defaultTokenizer!.encode.bind(this.defaultTokenizer);
  }

  tokenizerDecoder() {
    if (!this.defaultTokenizer) {
      this.initDefaultTokenizer();
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
