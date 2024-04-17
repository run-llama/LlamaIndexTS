import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { isAsyncIterable, prettifyError } from "../internal/utils.js";
import type {
  ChatMessage,
  ChatResponseChunk,
  TextChatMessage,
  ToolCall,
} from "../llm/index.js";
import type { BaseTool } from "../types.js";
import type { ToolOutput } from "./base.js";

export async function callTool(
  tool: BaseTool | undefined,
  toolCall: ToolCall,
): Promise<ToolOutput> {
  if (!tool) {
    const output = `Tool ${toolCall.name} does not exist.`;
    return {
      tool,
      input: toolCall.input,
      output,
      isError: true,
    };
  }
  const call = tool.call;
  let output: string;
  if (!call) {
    output = `Tool ${tool.metadata.name} (remote:${toolCall.name}) does not have a implementation.`;
    return {
      tool,
      input: toolCall.input,
      output,
      isError: true,
    };
  }
  try {
    let input = toolCall.input;
    if (typeof input === "string") {
      input = JSON.parse(input);
    }
    getCallbackManager().dispatchEvent("llm-tool-call", {
      payload: {
        toolCall: { ...toolCall },
      },
    });
    output = await call.call(tool, input);
    const toolOutput: ToolOutput = {
      tool,
      input: toolCall.input,
      output,
      isError: false,
    };
    getCallbackManager().dispatchEvent("llm-tool-result", {
      payload: {
        toolCall: { ...toolCall },
        toolResult: { ...toolOutput },
      },
    });
    return toolOutput;
  } catch (e) {
    output = prettifyError(e);
  }
  return {
    tool,
    input: toolCall.input,
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
