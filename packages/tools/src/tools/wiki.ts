import { tool } from "@llamaindex/core/tools";
import { z } from "@llamaindex/core/zod";
import { default as wikipedia } from "wikipedia";

export type WikiToolOutput = {
  title: string;
  content: string;
};

export const wiki = () => {
  return tool({
    name: "wikipedia",
    description: "Use this function to search Wikipedia",
    parameters: z.object({
      query: z.string().describe("The query to search for"),
      lang: z.string().describe("The language to search in").default("en"),
    }),
    execute: async ({ query, lang }): Promise<WikiToolOutput> => {
      wikipedia.setLang(lang);
      const searchResult = await wikipedia.search(query);
      const pageTitle = searchResult?.results[0]?.title;
      if (!pageTitle) return { title: "No search results.", content: "" };
      const result = await wikipedia.page(pageTitle, { autoSuggest: false });
      return { title: pageTitle, content: await result.content() };
    },
  });
};
