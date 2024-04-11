import type { JSONSchemaType } from "ajv";
import type { BaseTool, ToolMetadata } from "../types.js";

export class FunctionTool<T, R extends string | Promise<string>>
  implements BaseTool<T>
{
  constructor(
    private readonly _fn: (input: T) => R,
    private readonly _metadata: ToolMetadata<JSONSchemaType<T>>,
  ) {}

  static from<T>(
    fn: (input: T) => string | Promise<string>,
    schema: ToolMetadata<JSONSchemaType<T>>,
  ): FunctionTool<T, string | Promise<string>>;
  static from<T, R extends string | Promise<string>>(
    fn: (input: T) => R,
    schema: ToolMetadata<JSONSchemaType<T>>,
  ): FunctionTool<T, R> {
    return new FunctionTool(fn, schema);
  }

  get metadata(): BaseTool<T>["metadata"] {
    return this._metadata as BaseTool<T>["metadata"];
  }

  call(input: T) {
    return this._fn(input);
  }
}
