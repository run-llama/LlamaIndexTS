import { consoleLogger, type Logger } from "@llamaindex/env";
import type { JSONSchemaType } from "ajv";
import type * as z3 from "zod/v3";
import type * as z4 from "zod/v4/core";
import type { JSONValue } from "../global";
import type { BaseTool, ToolMetadata } from "../llms";
import {
  isZodSchema,
  safeParseSchema,
  type ZodSchema,
  zodToJsonSchema,
} from "../zod";

export class FunctionTool<
  T,
  R extends JSONValue | Promise<JSONValue>,
  AdditionalToolArgument extends object = object,
> implements BaseTool<T>
{
  #fn: (input: T, additionalArg?: AdditionalToolArgument) => R;
  #additionalArg: AdditionalToolArgument | undefined;
  readonly #metadata: ToolMetadata<JSONSchemaType<T>>;
  readonly #zodType: ZodSchema<T> | null = null;
  readonly #logger: Logger;

  constructor(
    fn: (input: T, additionalArg?: AdditionalToolArgument) => R,
    metadata: ToolMetadata<JSONSchemaType<T>>,
    zodType?: ZodSchema<T>,
    additionalArg?: AdditionalToolArgument,
    logger?: Logger,
  ) {
    this.#fn = fn;
    this.#metadata = metadata;
    if (zodType) {
      this.#zodType = zodType;
    }
    this.#additionalArg = additionalArg;
    this.#logger = logger ?? consoleLogger;
  }

  // ----------------- OVERLOAD -----------------
  // Plain JSON schema
  static from<T, AdditionalToolArgument extends object = object>(
    fn: (
      input: T,
      additionalArg?: AdditionalToolArgument,
    ) => JSONValue | Promise<JSONValue>,
    schema: ToolMetadata<JSONSchemaType<T>>,
  ): FunctionTool<T, JSONValue | Promise<JSONValue>, AdditionalToolArgument>;

  // Function + Object configs + Zod v3 schema
  static from<
    R extends z3.ZodTypeAny,
    AdditionalToolArgument extends object = object,
  >(
    fn: (
      input: z3.infer<R>,
      additionalArg?: AdditionalToolArgument,
    ) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & { parameters: R },
  ): FunctionTool<
    z3.infer<R>,
    JSONValue | Promise<JSONValue>,
    AdditionalToolArgument
  >;

  // Function + Object configs + Zod v4 schema
  static from<
    R extends z4.$ZodType,
    AdditionalToolArgument extends object = object,
  >(
    fn: (
      input: z4.infer<R>,
      additionalArg?: AdditionalToolArgument,
    ) => JSONValue | Promise<JSONValue>,
    schema: Omit<ToolMetadata, "parameters"> & { parameters: R },
  ): FunctionTool<
    z4.infer<R>,
    JSONValue | Promise<JSONValue>,
    AdditionalToolArgument
  >;

  // Object configs + Zod v3 schema
  static from<R, AdditionalToolArgument extends object = object>(
    config: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
      execute: (
        // @ts-expect-error <R> should extend z3.ZodTypeAny
        // but we remove that to fix type instantiation is excessively deep and possibly infinite
        input: z3.infer<R>,
        additionalArg?: AdditionalToolArgument,
      ) => JSONValue | Promise<JSONValue>;
    },
  ): FunctionTool<
    // @ts-expect-error <R> should extend z3.ZodTypeAny
    // but we remove that to fix type instantiation is excessively deep and possibly infinite
    z3.infer<R>,
    JSONValue | Promise<JSONValue>,
    AdditionalToolArgument
  >;

  // Object configs + Zod v4 schema
  static from<R, AdditionalToolArgument extends object = object>(
    config: Omit<ToolMetadata, "parameters"> & {
      parameters: R;
      execute: (
        input: z4.infer<R>,
        additionalArg?: AdditionalToolArgument,
      ) => JSONValue | Promise<JSONValue>;
    },
  ): FunctionTool<
    z4.infer<R>,
    JSONValue | Promise<JSONValue>,
    AdditionalToolArgument
  >;

  // ----------------- IMPLEMENTATION -----------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static from(fnOrConfig: any, schema?: any): any {
    if (
      typeof schema === "undefined" &&
      typeof fnOrConfig === "object" &&
      fnOrConfig.execute
    ) {
      const { execute, parameters, ...restConfig } = fnOrConfig;

      if (isZodSchema(parameters)) {
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

    if (schema && isZodSchema(schema.parameters)) {
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
    let params = input;
    if (this.#zodType) {
      const result = safeParseSchema(this.#zodType, input);
      if (result.success) {
        params = result.data;
      } else {
        this.#logger.warn(result.error);
      }
    }
    return this.#fn.call(null, params, this.#additionalArg);
  };
}

/**
 * A simpler alias for creating a FunctionTool.
 */
export const tool = FunctionTool.from;
