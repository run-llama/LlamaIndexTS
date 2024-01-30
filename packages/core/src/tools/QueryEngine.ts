import { BaseQueryEngine, BaseTool, ToolMetadata } from "../types";

type QueryEngineArgs = {
  queryEngine: BaseQueryEngine;
  metadata?: Partial<ToolMetadata>;
  resolveInputErrors?: boolean;
};

/**
 * A Tool that uses a QueryEngine.
 */
export class QueryEngineTool implements BaseTool {
  queryEngine: BaseQueryEngine;
  metadata: ToolMetadata;
  resolveInputErrors: boolean = true;

  constructor(options: QueryEngineArgs) {
    this.queryEngine = options?.queryEngine;

    const metadata: ToolMetadata = {
      name: options?.metadata?.name ?? "query_engine_tool",
      description:
        options?.metadata?.description ??
        "Useful for running a natural language query against a knowledge base and get back a natural language response.",
      ...options?.metadata,
    };

    this.metadata = metadata;
    this.resolveInputErrors = options?.resolveInputErrors ?? true;
  }

  /**
   * Query the query engine and get a response.
   */
  async call(...args: any[]): Promise<any> {
    let queryStr: string;
    if (args != null && args.length > 0) {
      queryStr = String(args[0]);
    } else if (args != null && "input" in args) {
      queryStr = args["input"] as string;
    } else if (args != null && this.resolveInputErrors) {
      queryStr = String(args);
    } else {
      throw new Error(
        `Cannot call query engine without specifying \`input\` parameter.`,
      );
    }

    const response = await this.queryEngine.query({
      query: queryStr,
      stream: false,
    });

    return {
      content: String(response),
      toolName: this.metadata.name,
      rawInput: { input: queryStr },
      rawOutput: response,
    };
  }
}
