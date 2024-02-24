import type { BaseTool, ToolMetadata } from "../types.js";

type Metadata = {
  name: string;
  description: string;
  parameters: ToolMetadata["parameters"];
};

export class FunctionTool<T = any> implements BaseTool {
  private _fn: (...args: any[]) => any;
  private _metadata: ToolMetadata;

  constructor(fn: (...args: any[]) => any, metadata: Metadata) {
    this._fn = fn;
    this._metadata = metadata as ToolMetadata;
  }

  static fromDefaults<T = any>(
    fn: (...args: any[]) => any,
    metadata?: Metadata,
  ): FunctionTool<T> {
    return new FunctionTool(fn, metadata!);
  }

  get metadata(): ToolMetadata {
    return this._metadata;
  }

  async call(...args: any[]): Promise<any> {
    return this._fn(...args);
  }
}
