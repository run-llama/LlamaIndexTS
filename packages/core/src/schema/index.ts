import { z } from "zod";

export const refDocInfoSchema = z.object({
  nodeIds: z.set(z.string()),
  metadata: z.map(z.string(), z.any()),
});
