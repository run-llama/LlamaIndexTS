import {
  type JSONObject,
  type JSONValue,
  Settings,
} from "@llamaindex/core/global";
import type {
  BaseTool,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  PartialToolCall,
  TextChatMessage,
  ToolCall,
  ToolCallLLMMessageOptions,
  ToolOutput,
} from "@llamaindex/core/llms";
import { baseToolWithCallSchema } from "@llamaindex/core/schema";
import { ReadableStream } from "@llamaindex/env";
import { z } from "zod";
import type { Logger } from "../internal/logger.js";
import {
  isAsyncIterable,
  prettifyError,
  stringifyJSONToMessageContent,
} from "../internal/utils.js";
import type { AgentParamsBase } from "./base.js";
import type { TaskHandler } from "./types.js";

type StepToolsResponseParams<Model extends LLM> = {
  response: ChatResponse<ToolCallLLMMessageOptions>;
  tools: BaseTool[];
  step: Parameters<TaskHandler<Model, {}, ToolCallLLMMessageOptions>>[0];
  enqueueOutput: Parameters<
    TaskHandler<Model, {}, ToolCallLLMMessageOptions>
  >[1];
};

type StepToolsStreamingResponseParams<Model extends LLM> = Omit<
  StepToolsResponseParams<Model>,
  "response"
> & {
  response: AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>;
};

// #TODO stepTools and stepToolsStreaming should be moved to a better abstraction

export async function stepToolsStreaming<Model extends LLM>({
  response,
  tools,
  step,
  enqueueOutput,
}: StepToolsStreamingResponseParams<Model>) {
  const responseChunkStream = new ReadableStream<
    ChatResponseChunk<ToolCallLLMMessageOptions>
  >({
    async start(controller) {
      for await (const chunk of response) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
  const [pipStream, finalStream] = responseChunkStream.tee();
  const reader = pipStream.getReader();
  const { value } = await reader.read();
  reader.releaseLock();
  if (value === undefined) {
    throw new Error("first chunk value is undefined, this should not happen");
  }
  // check if first chunk has tool calls, if so, this is a function call
  // otherwise, it's a regular message
  const hasToolCall = !!(value.options && "toolCall" in value.options);

  enqueueOutput({
    taskStep: step,
    output: finalStream,
    isLast: !hasToolCall,
  });

  if (hasToolCall) {
    // you need to consume the response to get the full toolCalls
    const toolCalls = new Map<string, ToolCall | PartialToolCall>();
    for await (const chunk of pipStream) {
      if (chunk.options && "toolCall" in chunk.options) {
        const toolCall = chunk.options.toolCall;
        toolCall.forEach((toolCall) => {
          toolCalls.set(toolCall.id, toolCall);
        });
      }
    }

    // If there are toolCalls, but they didn't get read into the stream, used for Gemini
    if (!toolCalls.size && value.options && "toolCall" in value.options) {
      value.options.toolCall.forEach((toolCall) => {
        toolCalls.set(toolCall.id, toolCall);
      });
    }

    step.context.store.messages = [
      ...step.context.store.messages,
      {
        role: "assistant" as const,
        content: "",
        options: {
          toolCall: [...toolCalls.values()],
        },
      },
    ];
    for (const toolCall of toolCalls.values()) {
      const targetTool = tools.find(
        (tool) => tool.metadata.name === toolCall.name,
      );
      const toolOutput = await callTool(
        targetTool,
        toolCall,
        step.context.logger,
      );
      step.context.store.messages = [
        ...step.context.store.messages,
        {
          role: "user" as const,
          content: stringifyJSONToMessageContent(toolOutput.output),
          options: {
            toolResult: {
              result: toolOutput.output,
              isError: toolOutput.isError,
              id: toolCall.id,
            },
          },
        },
      ];
      step.context.store.toolOutputs.push(toolOutput);
    }
  }
}

export async function stepTools<Model extends LLM>({
  response,
  tools,
  step,
  enqueueOutput,
}: StepToolsResponseParams<Model>) {
  step.context.store.messages = [
    ...step.context.store.messages,
    response.message,
  ];
  const options = response.message.options ?? {};
  enqueueOutput({
    taskStep: step,
    output: response,
    isLast: !("toolCall" in options),
  });
  if ("toolCall" in options) {
    const { toolCall } = options;
    for (const call of toolCall) {
      const targetTool = tools.find((tool) => tool.metadata.name === call.name);
      const toolOutput = await callTool(targetTool, call, step.context.logger);
      step.context.store.toolOutputs.push(toolOutput);
      step.context.store.messages = [
        ...step.context.store.messages,
        {
          content: stringifyJSONToMessageContent(toolOutput.output),
          role: "user",
          options: {
            toolResult: {
              result: toolOutput.output,
              isError: toolOutput.isError,
              id: call.id,
            },
          },
        },
      ];
    }
  }
}

export async function callTool(
  tool: BaseTool | undefined,
  toolCall: ToolCall | PartialToolCall,
  logger: Logger,
): Promise<ToolOutput> {
  let input: JSONObject;
  if (typeof toolCall.input === "string") {
    try {
      input = JSON.parse(toolCall.input);
    } catch (e) {
      const output = `Tool ${toolCall.name} can't be called. Input is not a valid JSON object.`;
      logger.error(
        `${output} Try increasing the maxTokens parameter of your LLM. Invalid Input: ${toolCall.input}`,
      );
      return {
        tool,
        input: {},
        output,
        isError: true,
      };
    }
  } else {
    input = toolCall.input;
  }
  if (!tool) {
    logger.error(`Tool ${toolCall.name} does not exist.`);
    const output = `Tool ${toolCall.name} does not exist.`;
    return {
      tool,
      input,
      output,
      isError: true,
    };
  }
  const call = tool.call;
  let output: JSONValue;
  if (!call) {
    logger.error(
      `Tool ${tool.metadata.name} (remote:${toolCall.name}) does not have a implementation.`,
    );
    output = `Tool ${tool.metadata.name} (remote:${toolCall.name}) does not have a implementation.`;
    return {
      tool,
      input,
      output,
      isError: true,
    };
  }
  try {
    Settings.callbackManager.dispatchEvent("llm-tool-call", {
      payload: {
        toolCall: { ...toolCall, input },
      },
    });
    output = await call.call(tool, input);
    logger.log(
      `Tool ${tool.metadata.name} (remote:${toolCall.name}) succeeded.`,
    );
    logger.log(`Output: ${JSON.stringify(output)}`);
    const toolOutput: ToolOutput = {
      tool,
      input,
      output,
      isError: false,
    };
    Settings.callbackManager.dispatchEvent("llm-tool-result", {
      payload: {
        toolCall: { ...toolCall, input },
        toolResult: { ...toolOutput },
      },
    });
    return toolOutput;
  } catch (e) {
    output = prettifyError(e);
    logger.error(
      `Tool ${tool.metadata.name} (remote:${toolCall.name}) failed: ${output}`,
    );
  }
  return {
    tool,
    input,
    output,
    isError: true,
  };
}

export async function consumeAsyncIterable<Options extends object>(
  input: ChatMessage<Options>,
  previousContent?: string,
): Promise<ChatMessage<Options>>;
export async function consumeAsyncIterable<Options extends object>(
  input: AsyncIterable<ChatResponseChunk<Options>>,
  previousContent?: string,
): Promise<TextChatMessage<Options>>;
export async function consumeAsyncIterable<Options extends object>(
  input: ChatMessage<Options> | AsyncIterable<ChatResponseChunk<Options>>,
  previousContent: string = "",
): Promise<ChatMessage<Options>> {
  if (isAsyncIterable(input)) {
    const result: ChatMessage<Options> = {
      content: previousContent,
      // only assistant will give streaming response
      role: "assistant",
      options: {} as Options,
    };
    for await (const chunk of input) {
      result.content += chunk.delta;
      if (chunk.options) {
        result.options = {
          ...result.options,
          ...chunk.options,
        };
      }
    }
    return result;
  } else {
    return input;
  }
}

export function createReadableStream<T>(
  asyncIterable: AsyncIterable<T>,
): ReadableStream<T> {
  return new ReadableStream<T>({
    async start(controller) {
      for await (const chunk of asyncIterable) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

export function validateAgentParams<AI extends LLM>(
  params: AgentParamsBase<AI>,
) {
  if ("tools" in params) {
    z.array(baseToolWithCallSchema).parse(params.tools);
  } else {
    // todo: check `params.toolRetriever` when migrate to @llamaindex/core
  }
}
