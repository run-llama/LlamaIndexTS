import type { JSONValue } from "../global";

export {
  EventCaller,
  getEventCaller,
  isAsyncIterable,
  isIterable,
  wrapEventCaller,
} from "./event-caller";

export async function* streamConverter<S, D>(
  stream: AsyncIterable<S>,
  converter: (s: S) => D | null,
): AsyncIterable<D> {
  for await (const data of stream) {
    const newData = converter(data);
    if (newData === null) {
      return;
    }
    yield newData;
  }
}

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

export { wrapLLMEvent } from "./wrap-llm-event";

export {
  createMessageContent,
  extractDataUrlComponents,
  extractImage,
  extractSingleText,
  extractText,
  imageToDataUrl,
  messagesToHistory,
  toToolDescriptions,
} from "./llms";

export { objectEntries } from "./object-entries";
