import { baseToolWithCallSchema } from "@llamaindex/core/schema";
import { ReadableStream } from "@llamaindex/env";
import { z } from "zod";
import type { Logger } from "../internal/logger.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { isAsyncIterable, prettifyError } from "../internal/utils.js";
import type {
  ChatMessage,
  ChatResponseChunk,
  LLM,
  PartialToolCall,
  TextChatMessage,
  ToolCall,
} from "../llm/index.js";
import type { BaseTool, JSONObject, JSONValue, ToolOutput } from "../types.js";
import type { AgentParamsBase } from "./base.js";

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
    getCallbackManager().dispatchEvent("llm-tool-call", {
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
    getCallbackManager().dispatchEvent("llm-tool-result", {
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
