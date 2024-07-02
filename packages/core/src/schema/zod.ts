import { z } from "zod";

export const anyFunctionSchema = z.function(z.tuple([]).rest(z.any()), z.any());

export const toolMetadataSchema = z.object({
  description: z.string(),
  name: z.string(),
  parameters: z.record(z.any()),
});

export const baseToolSchema = z.object({
  call: anyFunctionSchema.optional(),
  metadata: toolMetadataSchema,
});

export const baseToolWithCallSchema = baseToolSchema.extend({
  call: z.function(),
});
