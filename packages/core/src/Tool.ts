import { BaseQueryEngine } from "./QueryEngine";

export interface ToolMetadata {
  description: string;
  name: string;
  argsKwargs?: Record<string, any>;
}

/**
 * Simple Tool interface. Likely to change.
 */
export interface BaseTool {
  metadata: ToolMetadata;
}

/**
 * A Tool that uses a QueryEngine.
 */
export interface QueryEngineTool extends BaseTool {
  queryEngine: BaseQueryEngine;
}
