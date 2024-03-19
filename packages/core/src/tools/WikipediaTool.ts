import { default as wiki } from "wikipedia";
import type { BaseTool, ToolMetadata } from "../types.js";

export type WikipediaToolParams = {
  metadata?: ToolMetadata;
};

type WikipediaCallParams = {
  query: string;
  lang?: string;
};

const DEFAULT_META_DATA: ToolMetadata = {
  name: "wikipedia_tool",
  description: "A tool that uses a query engine to search Wikipedia.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The query to search for",
      },
    },
    required: ["query"],
  },
};

export class WikipediaTool implements BaseTool {
  private readonly DEFAULT_LANG = "en";
  metadata: ToolMetadata;

  constructor(params?: WikipediaToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
  }

  async loadData(
    page: string,
    lang: string = this.DEFAULT_LANG,
  ): Promise<string> {
    wiki.default.setLang(lang);
    const pageResult = await wiki.default.page(page, { autoSuggest: false });
    const content = await pageResult.content();
    return content;
  }

  async call({
    query,
    lang = this.DEFAULT_LANG,
  }: WikipediaCallParams): Promise<string> {
    const searchResult = await wiki.default.search(query);
    if (searchResult.results.length === 0) return "No search results.";
    return await this.loadData(searchResult.results[0].title, lang);
  }
}
