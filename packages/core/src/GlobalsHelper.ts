import cl100k_base from "tiktoken/encoders/cl100k_base.json";
import { Tiktoken } from "tiktoken/lite";

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
    const encoding = new Tiktoken(
      cl100k_base.bpe_ranks,
      cl100k_base.special_tokens,
      cl100k_base.pat_str,
    );

    this.defaultTokenizer = {
      encode: (text: string) => {
        return encoding.encode(text);
      },
      decode: (tokens: Uint32Array) => {
        return new TextDecoder().decode(encoding.decode(tokens));
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
