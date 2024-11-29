import { CoreTool } from "ai";
import { LlamaCloudIndex, VectorStoreIndex } from "llamaindex";
import { z } from "zod";

export async function llamaindex({
  index,
  description,
}: {
  index: VectorStoreIndex | LlamaCloudIndex;
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
      return result?.message.content;
    },
  };
}
