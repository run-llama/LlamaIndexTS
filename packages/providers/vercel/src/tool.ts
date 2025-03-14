import { Settings } from "@llamaindex/core/global";
import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import { type CoreTool, type LanguageModelV1, tool } from "ai";
import { z } from "zod";
import { VercelLLM } from "./llm";

interface DatasourceIndex {
  asQueryEngine: () => BaseQueryEngine;
}

export function llamaindex({
  model,
  index,
  description,
}: {
  model: LanguageModelV1;
  index: DatasourceIndex;
  description?: string;
}): CoreTool {
  const llm = new VercelLLM({ model });
  return Settings.withLLM<CoreTool>(llm, () => {
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
  });
}
