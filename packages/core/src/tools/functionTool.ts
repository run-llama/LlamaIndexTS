import { BaseTool, ToolMetadata } from "../Tool";

type Callable = (...args: any[]) => any;

export class FunctionTool implements BaseTool {
  private _fn: Callable;
  private _metadata: ToolMetadata;

  constructor(fn: Callable, metadata: ToolMetadata) {
    this._fn = fn;
    this._metadata = metadata;
  }

  static fromDefaults(fn: Callable, metadata?: ToolMetadata): FunctionTool {
    return new FunctionTool(fn, metadata!);
  }

  get metadata(): ToolMetadata {
    return this._metadata;
  }

  async call(...args: any[]): Promise<any> {
    return this._fn(...args);
  }
}
