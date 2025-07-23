import { type Logger } from "@llamaindex/env";
import { callTool } from "../agent/utils.js";
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

export const callToolToMessage = async <
  AdditionalMessageOptions extends object = object,
>(
  tools: BaseTool[],
  toolCall: ToolCall,
  logger: Logger,
): Promise<ChatMessage<AdditionalMessageOptions> | null> => {
  const tool = tools?.find((t) => t.metadata.name === toolCall.name);

  const toolOutput = await callTool(tool, toolCall, logger);

  const toolResultMessage: ChatMessage<AdditionalMessageOptions> = {
    role: "user",
    content: stringifyJSONToMessageContent(toolOutput.output),
    options: {
      toolResult: {
        id: toolCall.id,
        result: toolOutput.output,
        isError: toolOutput.isError,
      },
    } as AdditionalMessageOptions,
  };

  return toolResultMessage;
};
