import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { prettifyError } from "../internal/utils.js";
import type { ToolCall } from "../llm/index.js";
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
    output = await call(toolCall.input);
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
