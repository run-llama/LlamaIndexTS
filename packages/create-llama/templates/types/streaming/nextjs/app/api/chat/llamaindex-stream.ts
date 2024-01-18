import {
  JSONValue,
  createCallbacksTransformer,
  createStreamDataTransformer,
  experimental_StreamData,
  trimStartOfStreamHelper,
  type AIStreamCallbacksAndOptions,
} from "ai";
import { Response } from "llamaindex";

type ParserOptions = {
  image_url?: string;
};

function createParser(
  res: AsyncIterable<Response>,
  data: experimental_StreamData,
  opts?: ParserOptions,
) {
  const trimStartOfStream = trimStartOfStreamHelper();
  return new ReadableStream<string>({
    start() {
      // if image_url is provided, send it via the data stream
      if (opts?.image_url) {
        const message: JSONValue = {
          type: "image_url",
          image_url: {
            url: opts.image_url,
          },
        };
        data.append(message);
      } else {
        data.append({}); // send an empty image response for the user's message
      }
    },
    async pull(controller): Promise<void> {
      for await (const message of res) {
        const text = trimStartOfStream(message.response ?? "");
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
      data.append({}); // send an empty image response for the assistant's message
      data.close();
    },
  });
}

export function LlamaIndexStream(
  res: AsyncIterable<Response>,
  opts?: {
    callbacks?: AIStreamCallbacksAndOptions;
    parserOptions?: ParserOptions;
  },
): { stream: ReadableStream; data: experimental_StreamData } {
  const data = new experimental_StreamData();
  return {
    stream: createParser(res, data, opts?.parserOptions)
      .pipeThrough(createCallbacksTransformer(opts?.callbacks))
      .pipeThrough(createStreamDataTransformer(true)),
    data,
  };
}
