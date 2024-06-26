import {
  getChunkSize,
  setChunkSize,
  withChunkSize,
} from "./settings/chunk-size";

export const Settings = {
  get chunkSize(): number | undefined {
    return getChunkSize();
  },
  set chunkSize(chunkSize: number | undefined) {
    setChunkSize(chunkSize);
  },
  withChunkSize<Result>(chunkSize: number, fn: () => Result): Result {
    return withChunkSize(chunkSize, fn);
  },
};
