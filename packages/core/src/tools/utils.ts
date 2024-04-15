import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import type { BaseTool } from "../types.js";
import { ToolOutput } from "./types.js";

export async function callToolWithErrorHandling(
  tool: BaseTool,
  input: unknown,
): Promise<ToolOutput> {
  if (!tool.call) {
    return new ToolOutput(
      "Error: Tool does not have a call function.",
      tool.metadata.name,
      input,
      null,
    );
  }
  try {
    getCallbackManager().dispatchEvent("llm-tool-call", {
      payload: {
        toolCall: {
          name: tool.metadata.name,
          input,
        },
      },
    });
    const value = await tool.call(
      typeof input === "string" ? JSON.parse(input) : input,
    );
    return new ToolOutput(value, tool.metadata.name, input, value);
  } catch (e) {
    return new ToolOutput(`Error: ${e}`, tool.metadata.name, input, e);
  }
}
