import type { JSONSchemaType } from "ajv";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JSONValue } from "../global";
import type { BaseTool, ToolMetadata } from "../llms";

const kOriginalFn = Symbol("originalFn");

export class FunctionTool<T, R extends JSONValue | Promise<JSONValue>>
  implements BaseTool<T>
{
  [kOriginalFn]?: (input: T) => R;

  #fn: (input: T) => R;
  #metadata: ToolMetadata<JSONSchemaType<T>>;
  // todo: for the future, we can use zod to validate the input parameters
  #zodType: z.ZodType<T> | null = null;
  constructor(
    fn: (input: T) => R,
    metadata: ToolMetadata<JSONSchemaType<T>>,
    zodType?: z.ZodType<T>,
  ) {
    this.#fn = fn;
    this.#metadata = metadata;
    if (zodType) {
      this.#zodType = zodType;
    }
  }

  static from<T>(
    fn: (input: T) => JSONValue | Promise<JSONValue>,
    schema: ToolMetadata<JSONSchemaType<T>>,
  ): FunctionTool<T, JSONValue | Promise<JSONValue>>;
  static from<T, R extends z.ZodType<T>>(
    fn: (input: T) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
    },
  ): FunctionTool<T, JSONValue>;
  static from(fn: any, schema: any): any {
    if (schema.parameter instanceof z.ZodSchema) {
      const jsonSchema = zodToJsonSchema(schema.parameter);
      return new FunctionTool(
        fn,
        {
          ...schema,
          parameters: jsonSchema,
        },
        schema.parameter,
      );
    }
    return new FunctionTool(fn, schema);
  }

  get metadata(): BaseTool<T>["metadata"] {
    return this.#metadata as BaseTool<T>["metadata"];
  }

  call(input: T) {
    return this.#fn.call(null, input);
  }
}
