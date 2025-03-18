import { LlamaIndexAdapter, StreamData, type JSONValue } from "ai";
import type { IncomingMessage, ServerResponse } from "http";
import {
  EngineResponse,
  StopEvent,
  Workflow,
  WorkflowContext,
  WorkflowEvent,
  type ChatMessage,
  type ChatResponseChunk,
} from "llamaindex";
import { ReadableStream } from "stream/web";
import { AgentRunEvent, type AgentInput } from "./type";

export async function chatWithWorkflow(
  workflow: Workflow<null, AgentInput, ChatResponseChunk>,
  messages: ChatMessage[],
): Promise<Response> {
  const context = workflow.run({ messages });
  const { stream, dataStream } = await createStreamFromWorkflowContext(context);
  const response = LlamaIndexAdapter.toDataStreamResponse(stream, {
    data: dataStream,
  });
  return response;
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
  }
  // Handle for AgentRunEvent
  if (event instanceof AgentRunEvent) {
    dataStream.appendMessageAnnotation({
      type: "agent",
      data: event.data as JSONValue,
    });
  }
}

export async function pipeResponse(
  response: ServerResponse,
  streamResponse: Response,
) {
  if (!streamResponse.body) return;
  const reader = streamResponse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) return response.end();
    response.write(value);
  }
}

export async function parseRequestBody(request: IncomingMessage) {
  const body = new Promise((resolve) => {
    const bodyParts: Buffer[] = [];
    let body: string;
    request
      .on("data", (chunk) => {
        bodyParts.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(bodyParts).toString();
        resolve(body);
      });
  }) as Promise<string>;
  const data = await body;
  return JSON.parse(data);
}
