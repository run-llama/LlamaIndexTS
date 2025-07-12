import { Settings } from "@llamaindex/core/global";
import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import { EngineResponse } from "@llamaindex/core/schema";
import { type LanguageModelV1, type Tool, tool } from "ai";
import { z } from "zod";
import { VercelLLM } from "./llm";

interface DatasourceIndex {
  asQueryEngine: () => BaseQueryEngine;
}

type ResponseField = keyof EngineResponse;

export function llamaindex({
  model,
  index,
  description,
  options,
}: {
  model: LanguageModelV1;
  index: DatasourceIndex;
  description?: string;
  options?: {
    fields?: ResponseField[];
  };
}): Tool {
  const llm = new VercelLLM({ model });
  return Settings.withLLM<Tool>(llm, () => {
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
        if (options?.fields) {
          const resultWithFields = {
            ...result,
            ...Object.fromEntries(
              options.fields.map((field) => [field, result[field]]),
            ),
          };
          return resultWithFields;
        }
        return result?.message.content ?? "No result found in documents.";
      },
    });
  });
}
