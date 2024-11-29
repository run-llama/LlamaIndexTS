import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { CoreTool } from "ai";
import { z } from "zod";

interface DatasourceIndex {
  asQueryEngine: () => BaseQueryEngine;
}

export async function llamaindex({
  index,
  description,
}: {
  index: DatasourceIndex;
  description?: string;
}): Promise<CoreTool> {
  const queryEngine = index.asQueryEngine();
  return {
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
  };
}
