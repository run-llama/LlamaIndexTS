import { EngineResponse, MetadataMode } from "@llamaindex/core/schema";
import { streamConverter } from "@llamaindex/core/utils";
import type { ServiceContext } from "../ServiceContext.js";
import type { ResponseBuilderPrompts } from "./builders.js";
import { getResponseBuilder } from "./builders.js";
import type {
  ResponseBuilder,
  SynthesizeQuery,
} from "./types.js";
import { BaseSynthesizer } from '@llamaindex/core/response-synthesizers';
import {
  StreamEngineResponse
} from '@llamaindex/core/schema';

/**
 * A ResponseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export class ResponseSynthesizer extends BaseSynthesizer
{
  responseBuilder: ResponseBuilder;
  metadataMode: MetadataMode;

  constructor({
    responseBuilder,
    serviceContext,
    metadataMode = MetadataMode.NONE,
  }: {
    responseBuilder?: ResponseBuilder;
    serviceContext?: ServiceContext;
    metadataMode?: MetadataMode;
  } = {}) {
    super(
      async (query: SynthesizeQuery, stream: boolean) => {
        const { nodesWithScore } = query;
        const textChunks: string[] = nodesWithScore.map(({ node }) =>
          node.getContent(this.metadataMode),
        );
        if (stream) {
          const response = await this.responseBuilder.getResponse(
            {
              ...query,
              textChunks,
            },
            true,
          );
          return StreamEngineResponse.fromIterable(response);
        }
        const response = await this.responseBuilder.getResponse(
          {
            ...query,
            textChunks,
          },
          false,
        );
        return EngineResponse.from(response, nodesWithScore);
      },
      {}
    );

    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(serviceContext);
    this.metadataMode = metadataMode;
  }

  _getPromptModules() {
    return {};
  }

  protected _getPrompts(): { [x: string]: ResponseBuilderPrompts } {
    const prompts = this.responseBuilder.getPrompts?.();
    return {
      ...prompts,
    };
  }

  protected _updatePrompts(promptsDict: {
    [x: string]: ResponseBuilderPrompts;
  }): void {
    this.responseBuilder.updatePrompts?.(promptsDict);
  }
}
