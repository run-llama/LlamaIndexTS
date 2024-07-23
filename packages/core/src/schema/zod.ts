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

export const sentenceSplitterSchema = z.object({
  chunkSize: z
    .number({
      description: "The token chunk size for each chunk.",
    })
    .gt(0)
    .default(1024),
  chunkOverlap: z
    .number({
      description: "The token overlap of each chunk when splitting.",
    })
    .gt(0)
    .default(200),
  separator: z
    .string({
      description: "Default separator for splitting into words",
    })
    .default(" "),
  paragraphSeparator: z
    .string({
      description: "Separator between paragraphs.",
    })
    .default("\n\n\n"),
  secondaryChunkingRegex: z
    .string({
      description: "Backup regex for splitting into sentences.",
    })
    .default("[^,.;。？！]+[,.;。？！]?"),
});
