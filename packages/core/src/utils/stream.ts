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
