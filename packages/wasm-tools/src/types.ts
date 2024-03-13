export type ToolParameters = {
  type: string | "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
};

export interface ToolMetadata {
  description: string;
  name: string;
  parameters?: ToolParameters;
}

export interface BaseTool {
  call?: (...args: any[]) => any;
  metadata: ToolMetadata;
}
