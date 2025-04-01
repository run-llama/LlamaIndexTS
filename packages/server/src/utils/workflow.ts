import { LlamaIndexAdapter, StreamData, type JSONValue } from "ai";
import type {
  AgentInputData,
  ChatResponseChunk,
  EngineResponse,
  WorkflowEvent,
} from "llamaindex";
import {
  AgentStream,
  AgentToolCallResult,
  AgentWorkflow,
  StopEvent,
  Workflow,
  type AgentWorkflowContext,
} from "llamaindex";
import { ReadableStream } from "stream/web";
import { SourceEvent, toSourceEvent, type SourceEventNode } from "../events";
import type { ServerWorkflow } from "../types";
import { downloadFile } from "./file";
import { sendSuggestedQuestionsEvent } from "./suggestion";

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
          appendEventDataToAnnotations(dataStream, event);
        }
      }
      controller.close();
    },
  });

  return LlamaIndexAdapter.toDataStreamResponse(stream, {
    data: dataStream,
    callbacks: {
      onFinal: async (content: string) => {
        const history = chatHistory.concat({ role: "assistant", content });
        await sendSuggestedQuestionsEvent(dataStream, history);
        dataStream.close();
      },
    },
  });
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
          appendEventDataToAnnotations(dataStream, event);
        }
      }
      controller.close();
    },
  });

  return LlamaIndexAdapter.toDataStreamResponse(stream, {
    data: dataStream,
    callbacks: {
      onFinal: async (content: string) => {
        const history = agentInput.chatHistory?.concat({
          role: "assistant",
          content,
        });
        await sendSuggestedQuestionsEvent(dataStream, history);
        dataStream.close();
      },
    },
  });
}

export async function* toStreamGenerator(
  input: AsyncIterable<ChatResponseChunk> | string,
): AsyncGenerator<ChatResponseChunk> {
  if (typeof input === "string") {
    yield { delta: input } as ChatResponseChunk;
    return;
  }

  for await (const chunk of input) {
    yield chunk;
  }
}

// append data of other events to the data stream as message annotations
function appendEventDataToAnnotations(
  dataStream: StreamData,
  event: WorkflowEvent<unknown>,
) {
  const transformedEvent = transformWorkflowEvent(event);

  // for SourceEvent, we need to trigger download files from LlamaCloud (if having)
  if (transformedEvent instanceof SourceEvent) {
    const sourceNodes = transformedEvent.data.data.nodes;
    downloadLlamaCloudFilesFromNodes(sourceNodes); // download files in background
  }

  dataStream.appendMessageAnnotation(transformedEvent.data as JSONValue);
}

// transform WorkflowEvent to another WorkflowEvent for annotations display purpose
// this useful for handling AgentWorkflow events, because we cannot easily append custom events like custom workflows
function transformWorkflowEvent(
  event: WorkflowEvent<unknown>,
): WorkflowEvent<unknown> {
  // modify AgentToolCallResult event
  if (event instanceof AgentToolCallResult) {
    const toolCallResult = event.data.toolOutput.result;

    // if AgentToolCallResult contains sourceNodes, convert it to SourceEvent
    if (
      typeof toolCallResult === "string" &&
      JSON.parse(toolCallResult).sourceNodes // TODO: better use Zod to validate and extract sourceNodes from toolCallResult
    ) {
      const sourceNodes = JSON.parse(toolCallResult).sourceNodes;
      return toSourceEvent(sourceNodes);
    }
  }

  return event;
}

async function downloadLlamaCloudFilesFromNodes(nodes: SourceEventNode[]) {
  const downloadedFiles: string[] = [];

  for (const node of nodes) {
    if (!node.url || !node.filePath) continue; // skip if url or filePath is not available
    if (downloadedFiles.includes(node.filePath)) continue; // skip if file already downloaded
    if (!node.metadata.pipeline_id) continue; // only download files from LlamaCloud

    await downloadFile(node.url, node.filePath);

    downloadedFiles.push(node.filePath);
  }
}
