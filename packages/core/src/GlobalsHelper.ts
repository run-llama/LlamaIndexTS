import { encodingForModel } from "js-tiktoken";

import { randomUUID } from "@llamaindex/env";
import type {
  Event,
  EventTag,
  EventType,
} from "./callbacks/CallbackManager.js";

export enum Tokenizers {
  CL100K_BASE = "cl100k_base",
}

/**
 * @internal Helper class singleton
 */
class GlobalsHelper {
  defaultTokenizer: {
    encode: (text: string) => Uint32Array;
    decode: (tokens: Uint32Array) => string;
  };

  constructor() {
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

  tokenizer(encoding?: Tokenizers) {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.defaultTokenizer!.encode.bind(this.defaultTokenizer);
  }

  tokenizerDecoder(encoding?: Tokenizers) {
    if (encoding && encoding !== Tokenizers.CL100K_BASE) {
      throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
    }

    return this.defaultTokenizer!.decode.bind(this.defaultTokenizer);
  }

  /**
   * @deprecated createEvent will be removed in the future,
   *  please use `new CustomEvent(eventType, { detail: payload })` instead.
   *
   *  Also, `parentEvent` will not be used in the future,
   *    use `AsyncLocalStorage` to track parent events instead.
   *    @example - Usage of `AsyncLocalStorage`:
   *    let id = 0;
   *    const asyncLocalStorage = new AsyncLocalStorage<number>();
   *    asyncLocalStorage.run(++id, async () => {
   *      setTimeout(() => {
   *        console.log('parent event id:', asyncLocalStorage.getStore()); // 1
   *      }, 1000)
   *    });
   */
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
      id: randomUUID(),
      type,
      // inherit parent tags if tags not set
      tags: tags || parentEvent?.tags,
      parentId: parentEvent?.id,
    };
  }
}

export const globalsHelper = new GlobalsHelper();
