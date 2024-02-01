import { ZodSchema } from "zod";
import { BaseTool, ToolMetadata } from "../types";

type IfZodSchema<T, True, False> = T extends ZodSchema ? True : False;

type Metadata<T = any> = {
  name: string;
  description: string;
  parameters: IfZodSchema<T, ZodSchema<{}>, ToolMetadata["parameters"]>;
};

export class FunctionTool<T = any> implements BaseTool {
  private _fn: (...args: any[]) => any;
  private _metadata: ToolMetadata;

  constructor(fn: (...args: any[]) => any, metadata: Metadata<T>) {
    this._fn = fn;
    this._metadata = metadata as ToolMetadata;
  }

  static fromDefaults<T = any>(
    fn: (...args: any[]) => any,
    metadata?: Metadata<T>,
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
