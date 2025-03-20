import { LlamaIndexAdapter, StreamData, type JSONValue } from "ai";
import {
  AgentStream,
  AgentWorkflow,
  EngineResponse,
  StopEvent,
  Workflow,
  type ChatResponseChunk,
} from "llamaindex";
import { ReadableStream } from "stream/web";
import type { AgentInput, ServerWorkflow } from "../types";

export async function runWorkflow(
  workflow: ServerWorkflow,
  agentInput: AgentInput,
) {
  if (workflow instanceof AgentWorkflow) {
    return runAgentWorkflow(workflow, agentInput);
  }
  return runNormalWorkflow(workflow, agentInput);
}

async function runAgentWorkflow(
  workflow: AgentWorkflow,
  agentInput: AgentInput,
) {
  const { userInput, chatHistory } = agentInput;
  const context = workflow.run(userInput, { chatHistory });

  const dataStream = new StreamData();

  const stream = new ReadableStream<EngineResponse>({
    async pull(controller) {
      for await (const event of context) {
        if (event instanceof AgentStream) {
          // for agent workflow, get the delta from AgentStream event and enqueue it
          const delta = event.data.delta;
          if (delta) {
            controller.enqueue({ delta } as EngineResponse);
          }
        } else {
          dataStream.appendMessageAnnotation(event.data as JSONValue);
        }
      }
      controller.close();
      dataStream.close();
    },
  });

  return LlamaIndexAdapter.toDataStreamResponse(stream, { data: dataStream });
}

async function runNormalWorkflow(
  workflow: Workflow<null, AgentInput, ChatResponseChunk>,
  agentInput: AgentInput,
) {
  const context = workflow.run(agentInput);
  const dataStream = new StreamData();

  const stream = new ReadableStream<EngineResponse>({
    async pull(controller) {
      for await (const event of context) {
        if (event instanceof StopEvent) {
          // for normal workflow, the event data from StopEvent is a generator of ChatResponseChunk
          // iterate over the generator and enqueue the delta of each chunk
          const generator = event.data as AsyncGenerator<ChatResponseChunk>;
          for await (const chunk of generator) {
            controller.enqueue({ delta: chunk.delta } as EngineResponse);
          }
        } else {
          // append data of other events to the data stream as message annotations
          dataStream.appendMessageAnnotation(event.data as JSONValue);
        }
      }
      controller.close();
      dataStream.close();
    },
  });

  return LlamaIndexAdapter.toDataStreamResponse(stream, { data: dataStream });
}
