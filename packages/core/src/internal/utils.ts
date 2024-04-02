export const isAsyncGenerator = (obj: unknown): obj is AsyncGenerator => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isGenerator = (obj: unknown): obj is Generator => {
  return obj != null && typeof obj === "object" && Symbol.iterator in obj;
};
