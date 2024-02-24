import type { BaseTool } from "../types.js";
import { ToolOutput } from "./types.js";

/**
 * Call tool with error handling.
 * @param tool: tool
 * @param inputDict: input dict
 * @param errorMessage: error message
 * @param raiseError: raise error
 * @returns: tool output
 */
export async function callToolWithErrorHandling(
  tool: BaseTool,
  inputDict: { [key: string]: any },
  errorMessage: string | null = null,
  raiseError: boolean = false,
): Promise<ToolOutput> {
  try {
    const value = await tool.call?.(inputDict);
    return new ToolOutput(value, tool.metadata.name, inputDict, value);
  } catch (e) {
    if (raiseError) {
      throw e;
    }
    errorMessage = errorMessage || `Error: ${e}`;
    return new ToolOutput(
      errorMessage,
      tool.metadata.name,
      { kwargs: inputDict },
      e,
    );
  }
}
