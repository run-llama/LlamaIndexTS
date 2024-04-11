import type { BaseTool } from "../types.js";
import { ToolOutput } from "./types.js";

export async function callToolWithErrorHandling(
  tool: BaseTool,
  inputDict: { [key: string]: any },
): Promise<ToolOutput> {
  if (!tool.call) {
    return new ToolOutput(
      "Error: Tool does not have a call function.",
      tool.metadata.name,
      { kwargs: inputDict },
      null,
    );
  }
  try {
    const value = await tool.call(inputDict);
    return new ToolOutput(value, tool.metadata.name, inputDict, value);
  } catch (e) {
    return new ToolOutput(
      `Error: ${e}`,
      tool.metadata.name,
      { kwargs: inputDict },
      e,
    );
  }
}
