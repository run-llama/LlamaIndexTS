import {
  createCallbacksTransformer,
  createStreamDataTransformer,
  trimStartOfStreamHelper,
  type AIStreamCallbacksAndOptions,
} from "ai";

function createParser(res: AsyncGenerator<any>) {
  const trimStartOfStream = trimStartOfStreamHelper();
  return new ReadableStream<string>({
    async pull(controller): Promise<void> {
      const { value, done } = await res.next();
      if (done) {
        controller.close();
        return;
      }

      const text = trimStartOfStream(value ?? "");
      if (text) {
        controller.enqueue(text);
      }
    },
  });
}

export function LlamaIndexStream(
  res: AsyncGenerator<any>,
  callbacks?: AIStreamCallbacksAndOptions,
): ReadableStream {
  return createParser(res)
    .pipeThrough(createCallbacksTransformer(callbacks))
    .pipeThrough(
      createStreamDataTransformer(callbacks?.experimental_streamData),
    );
}
