import type { JSONSchemaType } from "ajv";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JSONValue } from "../global";
import type { BaseTool, ToolMetadata } from "../llms";

export class FunctionTool<
  T,
  R extends JSONValue | Promise<JSONValue>,
  AdditionalToolArgument extends object = object,
> implements BaseTool<T>
{
  #fn: (input: T, additionalArg?: AdditionalToolArgument) => R;
  #additionalArg: AdditionalToolArgument | undefined;
  readonly #metadata: ToolMetadata<JSONSchemaType<T>>;
  readonly #zodType: z.ZodType<T> | null = null;
  constructor(
    fn: (input: T, additionalArg?: AdditionalToolArgument) => R,
    metadata: ToolMetadata<JSONSchemaType<T>>,
    zodType?: z.ZodType<T>,
    additionalArg?: AdditionalToolArgument,
  ) {
    this.#fn = fn;
    this.#metadata = metadata;
    if (zodType) {
      this.#zodType = zodType;
    }
    this.#additionalArg = additionalArg;
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
  static from<
    R extends z.ZodType,
    AdditionalToolArgument extends object = object,
  >(
    config: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
      execute: (
        input: z.infer<R>,
        additionalArg?: AdditionalToolArgument,
      ) => JSONValue | Promise<JSONValue>;
    },
  ): FunctionTool<
    z.infer<R>,
    JSONValue | Promise<JSONValue>,
    AdditionalToolArgument
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static from(fnOrConfig: any, schema?: any): any {
    // Handle the case where an object with execute function is passed
    if (
      typeof schema === "undefined" &&
      typeof fnOrConfig === "object" &&
      fnOrConfig.execute
    ) {
      const { execute, parameters, ...restConfig } = fnOrConfig;

      if (parameters instanceof z.ZodSchema) {
        const jsonSchema = zodToJsonSchema(parameters);
        return new FunctionTool(
          execute,
          {
            ...restConfig,
            parameters: jsonSchema,
          },
          parameters,
        );
      }

      return new FunctionTool(execute, fnOrConfig);
    }

    // Handle the original cases
    if (schema && schema.parameters instanceof z.ZodSchema) {
      const jsonSchema = zodToJsonSchema(schema.parameters);
      return new FunctionTool(
        fnOrConfig,
        {
          ...schema,
          parameters: jsonSchema,
        },
        schema.parameters,
      );
    }
    return new FunctionTool(fnOrConfig, schema);
  }

  get metadata(): BaseTool<T>["metadata"] {
    return this.#metadata as BaseTool<T>["metadata"];
  }

  bind = (additionalArg: AdditionalToolArgument) => {
    return new FunctionTool(
      this.#fn,
      this.#metadata,
      this.#zodType ?? undefined,
      additionalArg,
    );
  };

  call = (input: T) => {
    if (this.#metadata.requireContext) {
      const inputWithContext = input as Record<string, unknown>;
      if (!inputWithContext.context) {
        throw new Error(
          "Tool call requires context, but context parameter is missing",
        );
      }
    }
    if (this.#zodType) {
      const result = this.#zodType.safeParse(input);
      if (result.success) {
        if (this.#metadata.requireContext) {
          const { context } = input as Record<string, unknown>;
          return this.#fn.call(
            null,
            { context, ...result.data },
            this.#additionalArg,
          );
        } else {
          return this.#fn.call(null, result.data, this.#additionalArg);
        }
      } else {
        console.warn(result.error.errors);
      }
    }
    return this.#fn.call(null, input, this.#additionalArg);
  };
}
