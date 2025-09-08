/**
 * "zod/v3" is a “permalink” import starting from zod@3.25.0.
 * It's a stable entry point that always gives us Zod v3, even if the user has installed zod@4.
 */
import type * as Zod from "zod/v3";
import * as z3 from "zod/v3";
import * as z4 from "zod/v4/core";

export type ZodSchemaInput<T> = z3.ZodType<T> | z4.$ZodType<T>;

export { type Zod };

/**
 * Singleton wrapper around Zod.
 *
 * - Lazily loads `zod/v3` from peer deps (keeps it optional).
 * - Ensures stable API across Zod v3 and v4 (via permalink import).
 */
class ZodWrapper {
  private instance: typeof Zod | null = null;

  private loadZod(): typeof Zod {
    if (!this.instance) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        this.instance = require("zod/v3");
      } catch {
        throw new Error(
          "[@llamaindex/core] Zod is not installed. Run `npm install zod` to install it.",
        );
      }
    }
    return this.instance!;
  }

  get z(): typeof Zod {
    return this.loadZod();
  }

  parse<T>(schema: ZodSchemaInput<T>, data: unknown): T {
    if ("_zod" in schema) {
      // Zod v4
      return z4.parse(schema as z4.$ZodType<T>, data);
    } else {
      // Zod v3
      return (schema as z3.ZodType<T>).parse(data);
    }
  }

  safeParse<T>(schema: ZodSchemaInput<T>, data: unknown) {
    if ("_zod" in schema) {
      // Zod v4
      return z4.safeParse(schema as z4.$ZodType<T>, data);
    } else {
      // Zod v3
      return (schema as z3.ZodType<T>).safeParse(data);
    }
  }
}

export const Z = new ZodWrapper();
