import type { JSONSchemaType } from "ajv";
import { default as wiki } from "wikipedia";
import type { BaseTool, ToolMetadata } from "../types.js";

type WikipediaParameter = {
  query: string;
  lang?: string;
};

export type WikipediaToolParams = {
  metadata?: ToolMetadata<JSONSchemaType<WikipediaParameter>>;
};

const DEFAULT_META_DATA: ToolMetadata<JSONSchemaType<WikipediaParameter>> = {
  name: "wikipedia_tool",
  description: "A tool that uses a query engine to search Wikipedia.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The query to search for",
      },
      lang: {
        type: "string",
        description: "The language to search in",
        nullable: true,
      },
    },
    required: ["query"],
  },
};

export class WikipediaTool implements BaseTool<WikipediaParameter> {
  private readonly DEFAULT_LANG = "en";
  metadata: ToolMetadata<JSONSchemaType<WikipediaParameter>>;

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
  }: WikipediaParameter): Promise<string> {
    const searchResult = await wiki.default.search(query);
    if (searchResult.results.length === 0) return "No search results.";
    return await this.loadData(searchResult.results[0].title, lang);
  }
}
