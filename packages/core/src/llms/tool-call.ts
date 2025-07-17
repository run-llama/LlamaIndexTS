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

export const callTool = async <
  AdditionalMessageOptions extends object = object,
>(
  tools: BaseTool[],
  toolCall: ToolCall,
): Promise<ChatMessage<AdditionalMessageOptions> | null> => {
  const tool = tools?.find((t) => t.metadata.name === toolCall.name);
  // TODO: consider using BaseToolWithCall instead of BaseTool to avoid checking for tool.call
  if (tool && tool.call) {
    const result = await tool.call(toolCall.input);
    const toolResultMessage: ChatMessage<AdditionalMessageOptions> = {
      role: "user",
      content: stringifyJSONToMessageContent(result),
      options: {
        toolResult: {
          id: toolCall.id,
          result,
        },
      } as AdditionalMessageOptions,
    };
    return toolResultMessage;
  }
  return null;
};
