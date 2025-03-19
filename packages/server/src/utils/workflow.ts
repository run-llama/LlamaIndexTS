import { LlamaIndexAdapter, StreamData, type JSONValue } from "ai";
import {
  AgentWorkflow,
  EngineResponse,
  StopEvent,
  WorkflowContext,
  WorkflowEvent,
  type ChatResponseChunk,
} from "llamaindex";
import { ReadableStream } from "stream/web";
import type { AgentInput, ServerWorkflow } from "../types";

export async function runWorkflow(
  workflow: ServerWorkflow,
  agentInput: AgentInput,
) {
  if (workflow instanceof AgentWorkflow) {
    const { userInput, chatHistory } = agentInput;
    const context = workflow.run(userInput, { chatHistory });
    const { stream, dataStream } = await createStreamFromWorkflowContext(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context as any,
    );
    return LlamaIndexAdapter.toDataStreamResponse(stream, { data: dataStream });
  }

  const context = workflow.run(agentInput);
  const { stream, dataStream } = await createStreamFromWorkflowContext(context);
  return LlamaIndexAdapter.toDataStreamResponse(stream, { data: dataStream });
}

async function createStreamFromWorkflowContext<Input, Output, Context>(
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
    dataStream.appendMessageAnnotation(event.data as JSONValue);
  }
}
