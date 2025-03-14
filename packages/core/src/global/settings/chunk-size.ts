import { AsyncLocalStorage } from "@llamaindex/env";

const chunkSizeAsyncLocalStorage = new AsyncLocalStorage<number | undefined>();
let globalChunkSize: number = 1024;

export function getChunkSize(): number {
  return chunkSizeAsyncLocalStorage.getStore() ?? globalChunkSize;
}

export function setChunkSize(chunkSize: number | undefined) {
  if (chunkSize !== undefined) {
    globalChunkSize = chunkSize;
  }
}

export function withChunkSize<Result>(
  embeddedModel: number,
  fn: () => Result,
): Result {
  return chunkSizeAsyncLocalStorage.run(embeddedModel, fn);
}
