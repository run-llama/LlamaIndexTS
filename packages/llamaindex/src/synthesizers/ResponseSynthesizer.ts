import { PromptMixin, type PromptsRecord } from "@llamaindex/core/prompts";
import { EngineResponse, MetadataMode } from "@llamaindex/core/schema";
import { streamConverter } from "@llamaindex/core/utils";
import type { ServiceContext } from "../ServiceContext.js";
import { getResponseBuilder } from "./builders.js";
import type {
  BaseSynthesizer,
  ResponseBuilder,
  SynthesizeQuery,
} from "./types.js";

/**
 * A ResponseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export class ResponseSynthesizer
  extends PromptMixin
  implements BaseSynthesizer
{
  responseBuilder: ResponseBuilder;
  metadataMode: MetadataMode;

  constructor({
    responseBuilder,
    serviceContext,
    metadataMode = MetadataMode.NONE,
  }: {
    responseBuilder?: ResponseBuilder | undefined;
    serviceContext?: ServiceContext | undefined;
    metadataMode?: MetadataMode | undefined;
  } = {}) {
    super();

    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(serviceContext);
    this.metadataMode = metadataMode;
  }

  _getPromptModules() {
    return {};
  }

  protected _getPrompts() {
    const prompts = this.responseBuilder.getPrompts?.();
    return {
      ...prompts,
    };
  }

  protected _updatePrompts(promptsRecord: PromptsRecord): void {
    this.responseBuilder.updatePrompts?.(promptsRecord);
  }

  synthesize(
    query: SynthesizeQuery,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  synthesize(query: SynthesizeQuery, stream?: false): Promise<EngineResponse>;
  async synthesize(
    query: SynthesizeQuery,
    stream?: boolean,
  ): Promise<AsyncIterable<EngineResponse> | EngineResponse> {
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
      return streamConverter(response, (chunk) =>
        EngineResponse.fromResponse(chunk, true, nodesWithScore),
      );
    }
    const response = await this.responseBuilder.getResponse(
      {
        ...query,
        textChunks,
      },
      false,
    );
    return EngineResponse.fromResponse(response, false, nodesWithScore);
  }
}
