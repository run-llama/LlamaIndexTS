import { z } from "zod";
import { Settings } from "../global";

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

export const sentenceSplitterSchema = z
  .object({
    chunkSize: z
      .number({
        description: "The token chunk size for each chunk.",
      })
      .gt(0)
      .optional()
      .default(() => Settings.chunkSize ?? 1024),
    chunkOverlap: z
      .number({
        description: "The token overlap of each chunk when splitting.",
      })
      .gte(0)
      .optional()
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
      .optional()
      .default("\n\n\n"),
    secondaryChunkingRegex: z
      .string({
        description: "Backup regex for splitting into sentences.",
      })
      .optional()
      .default("[^,.;。？！]+[,.;。？！]?"),
  })
  .refine((data) => data.chunkOverlap < data.chunkSize);

export const sentenceWindowNodeParserSchema = z.object({
  windowSize: z
    .number({
      description:
        "The number of sentences on each side of a sentence to capture.",
    })
    .gt(0)
    .default(3),
  windowMetadataKey: z
    .string({
      description: "The metadata key to store the sentence window under.",
    })
    .default("window"),
  originalTextMetadataKey: z
    .string({
      description: "The metadata key to store the original sentence in.",
    })
    .default("originalText"),
});
