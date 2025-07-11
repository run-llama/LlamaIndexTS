import type {
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
    return options.toolCall as ToolCall[];
  }
  return [];
};
