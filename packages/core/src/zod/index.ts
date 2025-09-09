/* eslint-disable @typescript-eslint/no-explicit-any */

import { zodToJsonSchema as zodToJsonSchemaV3 } from "@alcyone-labs/zod-to-json-schema";
import * as z from "zod";
import * as z3 from "zod/v3";
import * as z4 from "zod/v4/core";

export type ZodSchema<T = any> = z3.ZodType<T> | z4.$ZodType<T>;

export type ZodInfer<T extends ZodSchema> =
  T extends z3.ZodType<any>
    ? z3.infer<T>
    : T extends z4.$ZodType<any>
      ? z4.infer<T>
      : never;

// support parsing both Zod 3 schemas and Zod 4 schemas
export function parseSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  if ("_zod" in schema) {
    // Zod 4 schema
    return z4.parse(schema as z4.$ZodType<T>, data);
  } else {
    // Zod 3 schema
    return (schema as z3.ZodType<T>).parse(data);
  }
}

// safe parse schema
export function safeParseSchema<T>(schema: ZodSchema<T>, data: unknown) {
  if ("_zod" in schema) {
    // Zod 4 schema
    return z4.safeParse(schema as z4.$ZodType<T>, data);
  } else {
    // Zod 3 schema
    return (schema as z3.ZodType<T>).safeParse(data);
  }
}

// zod 3 schema contains parse, safeParse and has _def property
export function isZodV3Schema(obj: unknown): obj is z3.ZodTypeAny {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "parse" in obj &&
    typeof (obj as { parse: unknown }).parse === "function" &&
    "safeParse" in obj &&
    typeof (obj as { safeParse: unknown }).safeParse === "function" &&
    "_def" in obj
  );
}

// zod 4 schema contains _zod.def property
export function isZodV4Schema(obj: unknown): obj is z4.$ZodType {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "_zod" in obj &&
    typeof obj._zod === "object" &&
    obj._zod !== null &&
    "def" in obj._zod
  );
}

export function isZodSchema(obj: unknown): obj is ZodSchema {
  return isZodV3Schema(obj) || isZodV4Schema(obj);
}

export function zodToJsonSchema(obj: ZodSchema) {
  if (isZodV4Schema(obj)) {
    // if schema is created from zod v4, use native toJSONSchema
    return z4.toJSONSchema(obj);
  }

  // otherwise, use zod-to-json-schema
  return zodToJsonSchemaV3(obj as any); // FIXME: use any to avoid type instantiation excessively
}

export function getSchemaDescription(obj: ZodSchema) {
  if (isZodV4Schema(obj)) {
    // TODO: description is internal property in zod v4, need to find a better way to get it
    return ((obj as z4.$ZodType<any>)._zod.def as any).description;
  }
  return (obj as z3.ZodType<any>).description;
}

// re-export zod
export { z, z3, z4 };
