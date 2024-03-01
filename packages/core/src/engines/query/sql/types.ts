import { Response } from "../../../Response.js";
import {
  serviceContextFromDefaults,
  type ServiceContext,
} from "../../../ServiceContext.js";
import {
  CompactAndRefine,
  MetadataMode,
  ResponseSynthesizer,
} from "../../../index.js";
import type { SQLRetriever } from "../../../retriever/sql/types.js";
import type {
  BaseQueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../../types.js";
import {
  defaultResponseSynthesisPrompt,
  type ResponseSynthesisPrompt,
} from "./prompts.js";

export abstract class BaseSQLTableQueryEngine implements BaseQueryEngine {
  synthesizeResponse: boolean;
  responseSynthesisPrompt: ResponseSynthesisPrompt;
  serviceContext: ServiceContext;
  verbose: boolean;

  constructor(init: {
    synthesizeResponse?: boolean;
    responseSynthesisPrompt?: ResponseSynthesisPrompt;
    serviceContext?: ServiceContext;
    verbose?: boolean;
  }) {
    this.synthesizeResponse = init.synthesizeResponse ?? true;
    this.responseSynthesisPrompt =
      init.responseSynthesisPrompt || defaultResponseSynthesisPrompt;
    this.serviceContext = init.serviceContext || serviceContextFromDefaults({});
    this.verbose = init.verbose || false;
  }

  getPrompts(): {
    responseSynthesisPrompt: ResponseSynthesisPrompt;
  } {
    return { responseSynthesisPrompt: this.responseSynthesisPrompt };
  }

  updatePrompts(prompts: {
    responseSynthesisPrompt: ResponseSynthesisPrompt;
  }): void {
    if ("responseSynthesisPrompt" in prompts) {
      this.responseSynthesisPrompt = prompts.responseSynthesisPrompt;
    }
  }

  getPromptModules(): {
    sqlRetriever: SQLRetriever;
  } {
    return { sqlRetriever: this.sqlRetriever };
  }

  abstract get sqlRetriever(): SQLRetriever;

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;

    if (stream) {
      throw new Error("Streaming is not supported");
    }

    const [retrievedNodes, metadata] =
      await this.sqlRetriever.retrieveWithMetadata({
        queryStr: query,
      });

    const sqlQueryStr = metadata.sqlQuery;

    console.log(`> SQL query: ${sqlQueryStr}`); // TODO: Remove

    console.log(`> Sythesize Response ${this.synthesizeResponse}`);

    if (this.synthesizeResponse) {
      const responseBuilder = new CompactAndRefine(
        this.serviceContext,
        ({ query, context }) =>
          this.responseSynthesisPrompt({
            query,
            context,
            sqlQuery: sqlQueryStr,
          }),
      );

      const responseSynthesizer = new ResponseSynthesizer({
        serviceContext: this.serviceContext,
        responseBuilder,
      });

      const response = await responseSynthesizer.synthesize({
        query,
        nodesWithScore: retrievedNodes,
      });

      response.metadata.sqlQuery = sqlQueryStr;

      return response;
    }

    const responseStr = retrievedNodes
      .map((node) => node.node.getContent(MetadataMode.ALL))
      .join("\n");

    return new Response(responseStr, []);
  }
}
