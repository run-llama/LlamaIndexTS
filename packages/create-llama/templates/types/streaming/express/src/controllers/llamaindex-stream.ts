import {
  createCallbacksTransformer,
  createStreamDataTransformer,
  trimStartOfStreamHelper,
  type AIStreamCallbacksAndOptions,
} from "ai";
import { Response } from "llamaindex";

function createParser(res: AsyncIterable<Response>) {
  const it = res[Symbol.asyncIterator]();
  const trimStartOfStream = trimStartOfStreamHelper();
  return new ReadableStream<string>({
    async pull(controller): Promise<void> {
      const { value, done } = await it.next();
      if (done) {
        controller.close();
        return;
      }

      const text = trimStartOfStream(value.response ?? "");
      if (text) {
        controller.enqueue(text);
      }
    },
  });
}

export function LlamaIndexStream(
  res: AsyncIterable<Response>,
  callbacks?: AIStreamCallbacksAndOptions,
): ReadableStream {
  return createParser(res)
    .pipeThrough(createCallbacksTransformer(callbacks))
    .pipeThrough(
      createStreamDataTransformer(callbacks?.experimental_streamData),
    );
}
