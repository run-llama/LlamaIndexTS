import { ZodSchema } from "zod";
import { BaseTool, ToolMetadata } from "../Tool";

type Callable = (...args: any[]) => any;

type Metadata = {
  name: string;
  description: string;
  parameters: ToolMetadata["parameters"] | ZodSchema<{}>;
};

export class FunctionTool implements BaseTool {
  private _fn: Callable;
  private _metadata: ToolMetadata;

  constructor(fn: Callable, metadata: Metadata) {
    this._fn = fn;
    this._metadata = metadata as ToolMetadata;
  }

  static fromDefaults(fn: Callable, metadata?: Metadata): FunctionTool {
    return new FunctionTool(fn, metadata!);
  }

  get metadata(): ToolMetadata {
    return this._metadata;
  }

  async call(...args: any[]): Promise<any> {
    return this._fn(...args);
  }
}
