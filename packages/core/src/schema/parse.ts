import * as z3 from "zod/v3";
import * as z4 from "zod/v4/core";

type ZodSchemaInput<T> = z3.ZodType<T> | z4.$ZodType<T>;

// support parsing both Zod 3 schemas and Zod 4 schemas
export function parseSchema<T>(schema: ZodSchemaInput<T>, data: unknown): T {
  if ("_zod" in schema) {
    // Zod 4 schema
    return z4.parse(schema as z4.$ZodType<T>, data);
  } else {
    // Zod 3 schema
    return (schema as z3.ZodType<T>).parse(data);
  }
}
