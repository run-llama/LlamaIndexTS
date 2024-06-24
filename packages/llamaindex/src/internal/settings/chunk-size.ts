import { AsyncLocalStorage } from "@llamaindex/env";

const chunkSizeAsyncLocalStorage = new AsyncLocalStorage<number | undefined>();
const globalChunkSize: number | null = null;

export function getChunkSize(): number | undefined {
  return globalChunkSize ?? chunkSizeAsyncLocalStorage.getStore();
}

export function setChunkSize(chunkSize: number | undefined) {
  chunkSizeAsyncLocalStorage.enterWith(chunkSize);
}

export function withChunkSize<Result>(
  embeddedModel: number,
  fn: () => Result,
): Result {
  return chunkSizeAsyncLocalStorage.run(embeddedModel, fn);
}
