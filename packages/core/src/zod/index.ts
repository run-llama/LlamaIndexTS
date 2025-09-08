/**
 * "zod/v3" is a “permalink” import starting from zod@3.25.0.
 * It's a stable entry point that always gives us Zod v3, even if the user has installed zod@4.
 */
import type * as Zod from "zod/v3";
import * as z3 from "zod/v3";
import * as z4 from "zod/v4/core";

let zInstance: typeof Zod | null = null;

/**
 * Try to load zod lazily from peer deps
 */
function loadZod(): typeof Zod {
  if (!zInstance) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      zInstance = require("zod/v3");
    } catch {
      throw new Error(
        "[@llamaindex/core] Zod is not installed. Run `npm install zod` to install it.",
      );
    }
  }
  return zInstance!;
}

/**
 * Expose the zod instance through our wrapper
 */
export const z: typeof Zod = new Proxy({} as typeof Zod, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (loadZod() as any)[prop];
  },
});

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

// re-export type utilities
export type ZodType = typeof z.ZodType;
export { type Zod };
