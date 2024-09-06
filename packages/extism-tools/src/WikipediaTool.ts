import createPlugin from "@extism/extism";
import type { BaseTool, ToolMetadata } from "@llamaindex/core/llms";
import type { JSONSchemaType } from "ajv";

type WikipediaParameter = {
  query: string;
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
    },
    required: ["query"],
  },
};

export class WikipediaTool implements BaseTool<WikipediaParameter> {
  private readonly WASM_FILE = "./dist/wasm/wiki.wasm";
  private readonly ALLOWED_HOSTS = ["*.wikipedia.org"];
  private readonly MAX_HTTP_RESPONSE_BYTES = 100 * 1024 * 1024;

  metadata: ToolMetadata<JSONSchemaType<WikipediaParameter>>;

  constructor(params?: WikipediaToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
  }

  async runWikiSummary(query: string) {
    const plugin = await createPlugin(this.WASM_FILE, {
      useWasi: true,
      runInWorker: true,
      allowedHosts: this.ALLOWED_HOSTS,
      memory: { maxHttpResponseBytes: this.MAX_HTTP_RESPONSE_BYTES },
    });
    try {
      const params = { query };
      const data = await plugin.call("summary", JSON.stringify(params));
      if (!data) return "No search results.";
      return data.json().extract;
    } catch (e) {
      console.error(e);
    } finally {
      await plugin.close();
    }
  }

  async call({ query }: WikipediaParameter): Promise<string> {
    return await this.runWikiSummary(query);
  }
}
