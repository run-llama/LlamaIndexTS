import { BaseQueryEngine } from "./QueryEngine";

export interface ToolMetadata {
  description: string;
  name: string;
}

export interface BaseTool {
  metadata: ToolMetadata;
}

export interface QueryEngineTool extends BaseTool {
  queryEngine: BaseQueryEngine;
}
