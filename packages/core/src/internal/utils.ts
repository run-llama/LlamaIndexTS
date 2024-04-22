import type { JSONValue } from "../types.js";

export const isAsyncIterable = (
  obj: unknown,
): obj is AsyncIterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isIterable = (obj: unknown): obj is Iterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.iterator in obj;
};

/**
 * Prettify an error for AI to read
 */
export function prettifyError(error: unknown): string {
  if (error instanceof Error) {
    return `Error(${error.name}): ${error.message}`;
  } else {
    return `${error}`;
  }
}

export function stringifyJSONToMessageContent(value: JSONValue): string {
  return JSON.stringify(value, null, 2).replace(/"([^"]*)"/g, "$1");
}
