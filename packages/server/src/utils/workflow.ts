import type { ChatResponseChunk } from "@llamaindex/core/llms";
import type { EngineResponse } from "@llamaindex/core/schema";
import {
  StopEvent,
  Workflow,
  type AgentWorkflowContext,
} from "@llamaindex/workflow";
import {
  AgentStream,
  AgentWorkflow,
  type AgentInputData,
} from "@llamaindex/workflow/agent";
import { LlamaIndexAdapter, StreamData, type JSONValue } from "ai";
import { ReadableStream } from "stream/web";
import type { ServerWorkflow } from "../types";

export async function runWorkflow(
  workflow: ServerWorkflow,
  agentInput: AgentInputData,
) {
  if (workflow instanceof AgentWorkflow) {
    return runAgentWorkflow(workflow, agentInput);
  }
  return runCustomWorkflow(workflow, agentInput);
}

async function runAgentWorkflow(
  workflow: AgentWorkflow,
  agentInput: AgentInputData,
) {
  const { userInput = "", chatHistory = [] } = agentInput;
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

async function runCustomWorkflow(
  workflow: Workflow<AgentWorkflowContext, AgentInputData, string>,
  agentInput: AgentInputData,
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
