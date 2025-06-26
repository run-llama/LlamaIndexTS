import type { JSONValue } from "../global";

export const isPromise = <T>(obj: unknown): obj is Promise<T> => {
  return obj != null && typeof obj === "object" && "then" in obj;
};

export const isAsyncIterable = (
  obj: unknown,
): obj is AsyncIterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isIterable = (obj: unknown): obj is Iterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.iterator in obj;
};

export async function* streamCallbacks<S>(
  stream: AsyncIterable<S>,
  callbacks: {
    finished?: (value?: S) => void;
  },
): AsyncIterable<S> {
  let value: S | undefined;
  for await (value of stream) {
    yield value;
  }
  if (callbacks.finished) {
    callbacks.finished(value);
  }
}

export async function* streamReducer<S, D>(params: {
  stream: AsyncIterable<S>;
  reducer: (previousValue: D, currentValue: S) => D;
  initialValue: D;
  finished?: (value: D) => void;
}): AsyncIterable<S> {
  let value = params.initialValue;
  for await (const data of params.stream) {
    value = params.reducer(value, data);
    yield data;
  }
  if (params.finished) {
    params.finished(value);
  }
}

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

export {
  base64ToBlob,
  extractDataUrlComponents,
  extractImage,
  extractSingleText,
  extractText,
  getMimeTypeFromImageURL,
  imageToDataUrl,
  messagesToHistory,
  toToolDescriptions,
} from "./llms";

export { MockLLM } from "./mock";

export { objectEntries } from "./object-entries";
export * from "./stream";
