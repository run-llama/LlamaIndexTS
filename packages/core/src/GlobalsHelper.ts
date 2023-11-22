import { encodingForModel } from "js-tiktoken";

import { v4 as uuidv4 } from "uuid";
import { Event, EventTag, EventType } from "./callbacks/CallbackManager";

export enum Tokenizers {
  CL100K_BASE = "cl100k_base",
}

/**
 * Helper class singleton
 */
class GlobalsHelper {
  defaultTokenizer: {
    encode: (text: string) => Uint32Array;
    decode: (tokens: Uint32Array) => string;
  } | null = null;

  private initDefaultTokenizer() {
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

  tokenizer(encoding?: string) {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }
    if (!this.defaultTokenizer) {
      this.initDefaultTokenizer();
    }

    return this.defaultTokenizer!.encode.bind(this.defaultTokenizer);
  }

  tokenizerDecoder(encoding?: string) {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }
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
