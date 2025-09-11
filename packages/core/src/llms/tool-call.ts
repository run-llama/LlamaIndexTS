import { type Logger } from "@llamaindex/env";
import { callTool } from "../agent/utils.js";
import type { JSONValue } from "../global";
import { stringifyJSONToMessageContent } from "../utils";
import type {
  BaseTool,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "./type";

export const getToolCallsFromResponse = (
  response:
    | ChatResponse<ToolCallLLMMessageOptions>
    | ChatResponseChunk<ToolCallLLMMessageOptions>,
): ToolCall[] => {
  let options;

  if ("message" in response) {
    options = response.message.options;
  } else {
    options = response.options;
  }

  if (options && "toolCall" in options) {
    return (options.toolCall as ToolCall[]).map((toolCall) => ({
      ...toolCall,
      input:
        // XXX: this is a hack openai returns parsed object for streaming, but not for
        // non-streaming
        typeof toolCall.input === "string"
          ? JSON.parse(toolCall.input)
          : toolCall.input,
    }));
  }
  return [];
};

export type CallToolToMessageResult = {
  id: string;
  name: string;
  result: JSONValue;
  isError: boolean;
};

export const callToolToMessage = async (
  tools: BaseTool[],
  toolCall: ToolCall,
  logger: Logger,
): Promise<ChatMessage<{ toolResult: CallToolToMessageResult }>> => {
  const tool = tools?.find((t) => t.metadata.name === toolCall.name);
  const toolOutput = await callTool(tool, toolCall, logger);
  return {
    role: "user",
    content: stringifyJSONToMessageContent(toolOutput.output),
    options: {
      toolResult: {
        id: toolCall.id,
        name: toolCall.name,
        result: toolOutput.output,
        isError: toolOutput.isError,
      },
    },
  };
};
