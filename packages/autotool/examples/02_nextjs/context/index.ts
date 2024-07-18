import type { createStreamableUI } from "ai/rsc";
import { AsyncLocalStorage } from "node:async_hooks";

type StreamableUI = ReturnType<typeof createStreamableUI>;

const streamUIAsyncLocalStorage = new AsyncLocalStorage<StreamableUI>();

export function getCurrentStreamableUI() {
  return streamUIAsyncLocalStorage.getStore();
}

export function runWithStreamableUI<T>(streamUI: StreamableUI, fn: () => T): T {
  return streamUIAsyncLocalStorage.run(streamUI, fn);
}
