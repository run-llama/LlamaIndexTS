import { ReadableStream } from "@llamaindex/env";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { isAsyncIterable, prettifyError } from "../internal/utils.js";
import type {
  ChatMessage,
  ChatResponseChunk,
  PartialToolCall,
  TextChatMessage,
  ToolCall,
} from "../llm/index.js";
import type { BaseTool, JSONObject, JSONValue, ToolOutput } from "../types.js";

export async function callTool(
  tool: BaseTool | undefined,
  toolCall: ToolCall | PartialToolCall,
): Promise<ToolOutput> {
  const input: JSONObject =
    typeof toolCall.input === "string"
      ? JSON.parse(toolCall.input)
      : toolCall.input;
  if (!tool) {
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
): Promise<ChatMessage<Options>>;
export async function consumeAsyncIterable<Options extends object>(
  input: AsyncIterable<ChatResponseChunk<Options>>,
): Promise<TextChatMessage<Options>>;
export async function consumeAsyncIterable<Options extends object>(
  input: ChatMessage<Options> | AsyncIterable<ChatResponseChunk<Options>>,
): Promise<ChatMessage<Options>> {
  if (isAsyncIterable(input)) {
    const result: ChatMessage<Options> = {
      content: "",
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
