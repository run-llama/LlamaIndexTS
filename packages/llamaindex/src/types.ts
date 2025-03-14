/**
 * Top level types to avoid circular dependencies
 */
import type { ToolMetadata } from "@llamaindex/core/llms";

/**
 * StructuredOutput is just a combo of the raw output and the parsed output.
 */
export interface StructuredOutput<T> {
  rawOutput: string;
  parsedOutput: T;
}

export type ToolMetadataOnlyDescription = Pick<ToolMetadata, "description">;

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
