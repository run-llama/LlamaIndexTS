import type { Tokenizer } from "@llamaindex/env";
import {
  type CallbackManager,
  getCallbackManager,
  setCallbackManager,
  withCallbackManager,
} from "./settings/callback-manager";
import {
  getChunkSize,
  setChunkSize,
  withChunkSize,
} from "./settings/chunk-size";
import {
  getTokenizer,
  setTokenizer,
  withTokenizer,
} from "./settings/tokenizer";

export const Settings = {
  get tokenizer() {
    return getTokenizer();
  },
  set tokenizer(tokenizer) {
    setTokenizer(tokenizer);
  },
  withTokenizer<Result>(tokenizer: Tokenizer, fn: () => Result): Result {
    return withTokenizer(tokenizer, fn);
  },
  get chunkSize(): number | undefined {
    return getChunkSize();
  },
  set chunkSize(chunkSize: number | undefined) {
    setChunkSize(chunkSize);
  },
  withChunkSize<Result>(chunkSize: number, fn: () => Result): Result {
    return withChunkSize(chunkSize, fn);
  },

  get callbackManager(): CallbackManager {
    return getCallbackManager();
  },

  set callbackManager(callbackManager: CallbackManager) {
    setCallbackManager(callbackManager);
  },

  withCallbackManager<Result>(
    callbackManager: CallbackManager,
    fn: () => Result,
  ): Result {
    return withCallbackManager(callbackManager, fn);
  },
};
