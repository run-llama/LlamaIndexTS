import { MessageContent, MessageContentDetail } from "./types";

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
/**
 * Extracts just the text from a multi-modal message or the message itself if it's just text.
 *
 * @param message The message to extract text from.
 * @returns The extracted text
 */

export function extractText(message: MessageContent): string {
  if (Array.isArray(message)) {
    // message is of type MessageContentDetail[] - retrieve just the text parts and concatenate them
    // so we can pass them to the context generator
    return (message as MessageContentDetail[])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n\n");
  }
  return message;
}
