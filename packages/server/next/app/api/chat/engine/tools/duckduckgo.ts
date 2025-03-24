import { JSONSchemaType } from "ajv";
import { search } from "duck-duck-scrape";
import { BaseTool, ToolMetadata } from "llamaindex";

export type DuckDuckGoParameter = {
  query: string;
  region?: string;
  maxResults?: number;
};

export type DuckDuckGoToolParams = {
  metadata?: ToolMetadata<JSONSchemaType<DuckDuckGoParameter>>;
};

const DEFAULT_SEARCH_METADATA: ToolMetadata<
  JSONSchemaType<DuckDuckGoParameter>
> = {
  name: "duckduckgo_search",
  description:
    "Use this function to search for information (only text) in the internet using DuckDuckGo.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The query to search in DuckDuckGo.",
      },
      region: {
        type: "string",
        description:
          "Optional, The region to be used for the search in [country-language] convention, ex us-en, uk-en, ru-ru, etc...",
        nullable: true,
      },
      maxResults: {
        type: "number",
        description:
          "Optional, The maximum number of results to be returned. Default is 10.",
        nullable: true,
      },
    },
    required: ["query"],
  },
};

type DuckDuckGoSearchResult = {
  title: string;
  description: string;
  url: string;
};

export class DuckDuckGoSearchTool implements BaseTool<DuckDuckGoParameter> {
  metadata: ToolMetadata<JSONSchemaType<DuckDuckGoParameter>>;

  constructor(params: DuckDuckGoToolParams) {
    this.metadata = params.metadata ?? DEFAULT_SEARCH_METADATA;
  }

  async call(input: DuckDuckGoParameter) {
    const { query, region, maxResults = 10 } = input;
    const options = region ? { region } : {};
    // Temporarily sleep to reduce overloading the DuckDuckGo
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const searchResults = await search(query, options);

    return searchResults.results.slice(0, maxResults).map((result) => {
      return {
        title: result.title,
        description: result.description,
        url: result.url,
      } as DuckDuckGoSearchResult;
    });
  }
}

export function getTools() {
  return [new DuckDuckGoSearchTool({})];
}
