import type { JSONSchemaType } from "ajv";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JSONValue } from "../global";
import type { BaseTool, ToolMetadata } from "../llms";

export class FunctionTool<
  T,
  R extends JSONValue | Promise<JSONValue>,
  AdditionalToolArgument extends object = object,
> implements BaseTool<T, AdditionalToolArgument>
{
  #fn: (input: T, additionalArg?: AdditionalToolArgument) => R;
  readonly #metadata: ToolMetadata<JSONSchemaType<T>>;
  readonly #zodType: z.ZodType<T> | null = null;
  constructor(
    fn: (input: T, additionalArg?: AdditionalToolArgument) => R,
    metadata: ToolMetadata<JSONSchemaType<T>>,
    zodType?: z.ZodType<T>,
  ) {
    this.#fn = fn;
    this.#metadata = metadata;
    if (zodType) {
      this.#zodType = zodType;
    }
  }

  static from<T, AdditionalToolArgument extends object = object>(
    fn: (
      input: T,
      additionalArg?: AdditionalToolArgument,
    ) => JSONValue | Promise<JSONValue>,
    schema: ToolMetadata<JSONSchemaType<T>>,
  ): FunctionTool<T, JSONValue | Promise<JSONValue>, AdditionalToolArgument>;
  static from<
    R extends z.ZodType,
    AdditionalToolArgument extends object = object,
  >(
    fn: (
      input: z.infer<R>,
      additionalArg?: AdditionalToolArgument,
    ) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
    },
  ): FunctionTool<
    z.infer<R>,
    JSONValue | Promise<JSONValue>,
    AdditionalToolArgument
  >;
  static from<
    T,
    R extends z.ZodType<T>,
    AdditionalToolArgument extends object = object,
  >(
    fn: (
      input: T,
      additionalArg?: AdditionalToolArgument,
    ) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
    },
  ): FunctionTool<T, JSONValue, AdditionalToolArgument>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static from(fn: any, schema: any): any {
    if (schema.parameters instanceof z.ZodSchema) {
      const jsonSchema = zodToJsonSchema(schema.parameters);
      return new FunctionTool(
        fn,
        {
          ...schema,
          parameters: jsonSchema,
        },
        schema.parameters,
      );
    }
    return new FunctionTool(fn, schema);
  }

  get metadata(): BaseTool<T>["metadata"] {
    return this.#metadata as BaseTool<T>["metadata"];
  }

  call = (input: T, additionalArg?: AdditionalToolArgument) => {
    if (this.#zodType) {
      const result = this.#zodType.safeParse(input);
      if (result.success) {
        return this.#fn.call(null, result.data, additionalArg);
      } else {
        console.warn(result.error.errors);
      }
    }
    return this.#fn.call(null, input, additionalArg);
  };
}
