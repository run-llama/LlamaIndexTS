import { LlamaIndexAdapter, StreamData, type JSONValue } from "ai";
import fs from "fs";
import type {
  AgentInputData,
  ChatResponseChunk,
  EngineResponse,
  Metadata,
  NodeWithScore,
  WorkflowEvent,
} from "llamaindex";
import {
  AgentStream,
  AgentToolCall,
  AgentToolCallResult,
  AgentWorkflow,
  LLamaCloudFileService,
  StopEvent,
  Workflow,
  type AgentWorkflowContext,
} from "llamaindex";
import path from "path";
import { ReadableStream } from "stream/web";
import {
  SourceEvent,
  toAgentRunEvent,
  toSourceEvent,
  type SourceEventNode,
} from "../events";
import type { ServerWorkflow } from "../types";
import { downloadFile } from "./file";
import { sendSuggestedQuestionsEvent } from "./suggestion";

export async function runWorkflow(
  workflow: ServerWorkflow,
  agentInput: AgentInputData,
  componentsDir?: string,
) {
  if (workflow instanceof AgentWorkflow) {
    return runAgentWorkflow(workflow, agentInput, componentsDir);
  }
  return runCustomWorkflow(workflow, agentInput, componentsDir);
}

async function runAgentWorkflow(
  workflow: AgentWorkflow,
  agentInput: AgentInputData,
  componentsDir?: string,
) {
  const { userInput = "", chatHistory = [] } = agentInput;
  const context = workflow.run(userInput, { chatHistory });

  const dataStream = new StreamData();

  const stream = new ReadableStream<EngineResponse>({
    async pull(controller) {
      try {
        for await (const event of context) {
          if (event instanceof AgentStream) {
            // for agent workflow, get the delta from AgentStream event and enqueue it
            const delta = event.data.delta;
            if (delta) {
              controller.enqueue({ delta } as EngineResponse);
            }
          } else {
            appendEventDataToAnnotations(dataStream, event, componentsDir);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        controller.enqueue({ delta: errorMessage } as EngineResponse);
        dataStream.close();
      } finally {
        controller.close();
      }
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
  componentsDir?: string,
) {
  const context = workflow.run(agentInput);
  const dataStream = new StreamData();

  const stream = new ReadableStream<EngineResponse>({
    async pull(controller) {
      try {
        for await (const event of context) {
          if (event instanceof StopEvent) {
            // for normal workflow, the event data from StopEvent is a generator of ChatResponseChunk
            // iterate over the generator and enqueue the delta of each chunk
            const generator = event.data as AsyncGenerator<ChatResponseChunk>;
            for await (const chunk of generator) {
              controller.enqueue({ delta: chunk.delta } as EngineResponse);
            }
          } else {
            appendEventDataToAnnotations(dataStream, event, componentsDir);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        controller.enqueue({ delta: errorMessage } as EngineResponse);
        dataStream.close();
      } finally {
        controller.close();
      }
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
  componentsDir?: string,
) {
  const transformedEvent = transformWorkflowEvent(event);

  // for SourceEvent, we need to trigger download files from LlamaCloud (if having)
  if (transformedEvent instanceof SourceEvent) {
    const sourceNodes = transformedEvent.data.data.nodes;
    downloadLlamaCloudFilesFromNodes(sourceNodes); // download files in background
  }

  checkComponentAvailability(transformedEvent, componentsDir);

  dataStream.appendMessageAnnotation(transformedEvent.data as JSONValue);
}

function checkComponentAvailability(
  event: WorkflowEvent<unknown>,
  componentsDir?: string,
) {
  const availableChatUIComponents = ["sources"]; // already have default components for these event types

  if (
    !event.data ||
    typeof event.data !== "object" ||
    !("type" in event.data) ||
    typeof event.data.type !== "string" ||
    availableChatUIComponents.includes(event.data.type)
  ) {
    // skip warning if it's not a custom event type or already handled by default components
    return;
  }

  // if user doesn't provide a components directory, custom event types won't be displayed on the UI
  // then a warning will be shown
  if (!componentsDir) {
    console.warn(
      `Warning: No components directory provided. ${event.data.type} will not be displayed on the UI. Please specify "componentsDir" in the server options.`,
    );
    return;
  }

  // if user provides a components directory, check if the component file exists
  // if component file doesn't exist in the components directory, a warning will be shown
  const eventType = event.data.type;
  const files = fs.readdirSync(componentsDir);
  const availableComponents = files.map((f) =>
    path.basename(f, path.extname(f)),
  );
  if (!availableComponents.includes(eventType)) {
    console.warn(
      `Warning: No component found for event type: ${eventType}. Please add a component file named ${eventType}.tsx or ${eventType}.jsx in the ${componentsDir} directory.`,
    );
  }
}

// transform WorkflowEvent to another WorkflowEvent for annotations display purpose
// this useful for handling AgentWorkflow events, because we cannot easily append custom events like custom workflows
function transformWorkflowEvent(
  event: WorkflowEvent<unknown>,
): WorkflowEvent<unknown> {
  // convert AgentToolCall event to AgentRunEvent
  if (event instanceof AgentToolCall) {
    const inputString = JSON.stringify(event.data.toolKwargs);
    return toAgentRunEvent({
      agent: event.data.agentName,
      text: `Using tool: '${event.data.toolName}' with inputs: '${inputString}'`,
      type: "text",
    });
  }

  // modify AgentToolCallResult event
  if (event instanceof AgentToolCallResult) {
    const rawOutput = event.data.raw;

    // if AgentToolCallResult contains sourceNodes, convert it to SourceEvent
    if (
      rawOutput &&
      typeof rawOutput === "object" &&
      "sourceNodes" in rawOutput // TODO: better use Zod to validate and extract sourceNodes from toolCallResult
    ) {
      return toSourceEvent(
        rawOutput.sourceNodes as unknown as NodeWithScore<Metadata>[],
      );
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

    const downloadUrl = await LLamaCloudFileService.getFileUrl(
      node.metadata.pipeline_id,
      node.fileName,
    );
    if (!downloadUrl) continue;

    await downloadFile(downloadUrl, node.filePath);

    downloadedFiles.push(node.filePath);
  }
}
