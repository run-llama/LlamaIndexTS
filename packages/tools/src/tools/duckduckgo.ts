import { tool } from "@llamaindex/core/tools";
import { search } from "duck-duck-scrape";
import { z } from "zod";

export type DuckDuckGoToolOutput = Array<{
  title: string;
  description: string;
  url: string;
}>;

export const duckduckgo = () => {
  return tool({
    name: "duckduckgo_search",
    description:
      "Use this function to search for information (only text) in the internet using DuckDuckGo.",
    parameters: z.object({
      query: z.string().describe("The query to search in DuckDuckGo."),
      region: z
        .string()
        .optional()
        .describe(
          "Optional, The region to be used for the search in [country-language] convention, ex us-en, uk-en, ru-ru, etc...",
        ),
      maxResults: z
        .number()
        .default(10)
        .optional()
        .describe(
          "Optional, The maximum number of results to be returned. Default is 10.",
        ),
    }),
    execute: async ({
      query,
      region,
      maxResults = 10,
    }): Promise<DuckDuckGoToolOutput> => {
      const options = region ? { region } : {};
      const searchResults = await search(query, options);
      return searchResults.results.slice(0, maxResults).map((result) => {
        return {
          title: result.title,
          description: result.description,
          url: result.url,
        };
      });
    },
  });
};
