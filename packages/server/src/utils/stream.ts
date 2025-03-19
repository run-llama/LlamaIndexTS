import { StreamData, type JSONValue } from "ai";
import {
  EngineResponse,
  StopEvent,
  WorkflowContext,
  WorkflowEvent,
  type ChatResponseChunk,
} from "llamaindex";
import { ReadableStream } from "stream/web";

export async function createStreamFromWorkflowContext<Input, Output, Context>(
  context: WorkflowContext<Input, Output, Context>,
): Promise<{ stream: ReadableStream<EngineResponse>; dataStream: StreamData }> {
  const dataStream = new StreamData();
  let generator: AsyncGenerator<ChatResponseChunk> | undefined;

  const closeStreams = (controller: ReadableStreamDefaultController) => {
    controller.close();
    dataStream.close();
  };

  const stream = new ReadableStream<EngineResponse>({
    async start(controller) {
      // Kickstart the stream by sending an empty string
      controller.enqueue({ delta: "" } as EngineResponse);
    },
    async pull(controller) {
      while (!generator) {
        // get next event from workflow context
        const { value: event, done } =
          await context[Symbol.asyncIterator]().next();
        if (done) {
          closeStreams(controller);
          return;
        }
        generator = handleEvent(event, dataStream);
      }

      const { value: chunk, done } = await generator.next();
      if (done) {
        closeStreams(controller);
        return;
      }
      const delta = chunk.delta ?? "";
      if (delta) {
        controller.enqueue({ delta } as EngineResponse);
      }
    },
  });

  return { stream, dataStream };
}

function handleEvent(
  event: WorkflowEvent<unknown>,
  dataStream: StreamData,
): AsyncGenerator<ChatResponseChunk> | undefined {
  // Handle for StopEvent
  if (event instanceof StopEvent) {
    return event.data as AsyncGenerator<ChatResponseChunk>;
  } else {
    console.log("handleWorkflowEvent", event, event instanceof WorkflowEvent);
    dataStream.appendMessageAnnotation({
      type: "agent",
      data: event.data as JSONValue,
    });
  }
}
