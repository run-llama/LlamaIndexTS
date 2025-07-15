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
