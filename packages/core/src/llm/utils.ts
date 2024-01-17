export async function* streamConverter<S, D>(
  stream: AsyncIterable<S>,
  converter: (s: S) => D,
): AsyncIterable<D> {
  for await (const data of stream) {
    yield converter(data);
  }
}

export async function* streamReducer<S, D>(params: {
  stream: AsyncIterable<S>;
  reducer: (previousValue: D, currentValue: S) => D;
  initialValue: D;
  finished?: (value: D | undefined) => void;
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
