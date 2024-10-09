import type { JSONSchemaType } from "ajv";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JSONValue } from "../global";
import type { BaseTool, ToolMetadata } from "../llms";

export class FunctionTool<T, R extends JSONValue | Promise<JSONValue>>
  implements BaseTool<T>
{
  constructor(
    private readonly _fn: (input: T) => R,
    private readonly _metadata: ToolMetadata<JSONSchemaType<T>>,
  ) {}

  static from<T>(
    fn: (input: T) => JSONValue | Promise<JSONValue>,
    schema: ToolMetadata<JSONSchemaType<T>>,
  ): FunctionTool<T, JSONValue | Promise<JSONValue>>;
  static from<T, R extends z.ZodType<T>>(
    fn: (input: T) => JSONValue,
    schema: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
    },
  ): FunctionTool<T, JSONValue>;
  static from(fn: any, schema: any): any {
    if (schema.parameter instanceof z.ZodSchema) {
      const jsonSchema = zodToJsonSchema(schema.parameter);
      return new FunctionTool(fn, {
        ...schema,
        parameters: jsonSchema,
      });
    }
    return new FunctionTool(fn, schema);
  }

  get metadata(): BaseTool<T>["metadata"] {
    return this._metadata as BaseTool<T>["metadata"];
  }

  call(input: T) {
    return this._fn(input);
  }
}
