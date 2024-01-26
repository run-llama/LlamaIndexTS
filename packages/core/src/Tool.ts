import { z, ZodSchema } from "zod";
import { BaseQueryEngine } from "./QueryEngine";

export type ToolParameters = {
  type: string | "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
};

const toolParametersSchema = z.object({
  type: z.any(),
  description: z.any(),
});

export type ToolZodParameters = ZodSchema<typeof toolParametersSchema>;

export interface ToolMetadata {
  description: string;
  name: string;
  parameters?: ToolParameters;
  argsKwargs?: Record<string, any>;
}

/**
 * Simple Tool interface. Likely to change.
 */
export interface BaseTool {
  call?: (...args: any[]) => any;
  metadata: ToolMetadata;
}

/**
 * A Tool that uses a QueryEngine.
 */
export interface QueryEngineTool extends BaseTool {
  queryEngine: BaseQueryEngine;
}
