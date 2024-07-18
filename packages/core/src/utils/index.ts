export { wrapEventCaller } from "./event-caller";

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

export { wrapLLMEvent } from "./wrap-llm-event";

export {
  extractDataUrlComponents,
  extractImage,
  extractSingleText,
  extractText,
} from "./llms";
