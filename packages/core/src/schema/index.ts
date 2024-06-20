import { z } from "zod";

export const toolMetadataSchema = z.object({
  description: z.string(),
  name: z.string(),
  parameters: z.record(z.any()),
});

export const baseToolSchema = z.object({
  call: z.optional(z.function()),
  metadata: toolMetadataSchema,
});

export const baseToolWithCallSchema = baseToolSchema.extend({
  call: z.function(),
});
