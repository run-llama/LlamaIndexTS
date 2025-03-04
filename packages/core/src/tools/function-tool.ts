import type { JSONSchemaType } from "ajv";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JSONValue } from "../global";
import type { BaseTool, ToolMetadata } from "../llms";

export class FunctionTool<T, R extends JSONValue | Promise<JSONValue>>
  implements BaseTool<T>
{
  #fn: (input: T) => R;
  readonly #metadata: ToolMetadata<JSONSchemaType<T>>;
  readonly #zodType: z.ZodType<T> | null = null;
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
  static from<R extends z.ZodType>(
    fn: (input: z.infer<R>) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
    },
  ): FunctionTool<z.infer<R>, JSONValue | Promise<JSONValue>>;
  static from<T, R extends z.ZodType<T>>(
    fn: (input: T) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
    },
  ): FunctionTool<T, JSONValue>;
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

  call = (input: T) => {
    if (this.#zodType) {
      const result = this.#zodType.safeParse(input);
      if (result.success) {
        if (this.#metadata.requireContext) {
          const { context } = input as Record<string, unknown>;
          if (!context) {
            throw new Error(
              "Tool call requires context, but context parameter is missing",
            );
          }
          return this.#fn.call(null, { context, ...result.data });
        } else {
          return this.#fn.call(null, result.data);
        }
      } else {
        console.warn(result.error.errors);
      }
    }

    return this.#fn.call(null, input);
  };
}
