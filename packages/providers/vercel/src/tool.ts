import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import { type CoreTool, tool } from "ai";
import { z } from "zod";

interface DatasourceIndex {
  asQueryEngine: () => BaseQueryEngine;
}

export function llamaindex({
  index,
  description,
}: {
  index: DatasourceIndex;
  description?: string;
}): CoreTool {
  const queryEngine = index.asQueryEngine();
  return tool({
    description: description ?? "Get information about your documents.",
    parameters: z.object({
      query: z
        .string()
        .describe("The query to get information about your documents."),
    }),
    execute: async ({ query }) => {
      const result = await queryEngine?.query({ query });
      return result?.message.content ?? "No result found in documents.";
    },
  });
}
