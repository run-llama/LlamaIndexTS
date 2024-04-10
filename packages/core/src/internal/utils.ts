import type { MessageContent, QueryBundle } from "../types.js";

export const isAsyncGenerator = (obj: unknown): obj is AsyncGenerator => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isGenerator = (obj: unknown): obj is Generator => {
  return obj != null && typeof obj === "object" && Symbol.iterator in obj;
};

export function toQueryBundle(
  query: QueryBundle | MessageContent,
): QueryBundle {
  if (typeof query === "string" || Array.isArray(query)) {
    return { query };
  }
  return query;
}
