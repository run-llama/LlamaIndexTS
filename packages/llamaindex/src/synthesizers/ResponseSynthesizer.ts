import { MetadataMode } from "@llamaindex/core/schema";
import { EngineResponse } from "../EngineResponse.js";
import type { ServiceContext } from "../ServiceContext.js";
import { streamConverter } from "../llm/utils.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type { ResponseBuilderPrompts } from "./builders.js";
import { getResponseBuilder } from "./builders.js";
import type {
  BaseSynthesizer,
  ResponseBuilder,
  SynthesizeParamsNonStreaming,
  SynthesizeParamsStreaming,
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
    responseBuilder?: ResponseBuilder;
    serviceContext?: ServiceContext;
    metadataMode?: MetadataMode;
  } = {}) {
    super();

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

  synthesize(
    params: SynthesizeParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  synthesize(params: SynthesizeParamsNonStreaming): Promise<EngineResponse>;
  async synthesize({
    query,
    nodesWithScore,
    stream,
  }: SynthesizeParamsStreaming | SynthesizeParamsNonStreaming): Promise<
    AsyncIterable<EngineResponse> | EngineResponse
  > {
    const textChunks: string[] = nodesWithScore.map(({ node }) =>
      node.getContent(this.metadataMode),
    );
    if (stream) {
      const response = await this.responseBuilder.getResponse({
        query,
        textChunks,
        stream,
      });
      return streamConverter(response, (chunk) =>
        EngineResponse.fromResponse(chunk, true, nodesWithScore),
      );
    }
    const response = await this.responseBuilder.getResponse({
      query,
      textChunks,
    });
    return EngineResponse.fromResponse(response, false, nodesWithScore);
  }
}
