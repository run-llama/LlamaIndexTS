import { MetadataMode } from "../Node.js";
import { Response } from "../Response.js";
import type { ServiceContext } from "../ServiceContext.js";
import { serviceContextFromDefaults } from "../ServiceContext.js";
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
  serviceContext: ServiceContext;
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

    this.serviceContext = serviceContext ?? serviceContextFromDefaults();
    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(this.serviceContext);
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
  ): Promise<AsyncIterable<Response>>;
  synthesize(params: SynthesizeParamsNonStreaming): Promise<Response>;
  async synthesize({
    query,
    nodesWithScore,
    parentEvent,
    stream,
  }: SynthesizeParamsStreaming | SynthesizeParamsNonStreaming): Promise<
    AsyncIterable<Response> | Response
  > {
    const textChunks: string[] = nodesWithScore.map(({ node }) =>
      node.getContent(this.metadataMode),
    );
    const nodes = nodesWithScore.map(({ node }) => node);
    if (stream) {
      const response = await this.responseBuilder.getResponse({
        query,
        textChunks,
        parentEvent,
        stream,
      });
      return streamConverter(response, (chunk) => new Response(chunk, nodes));
    }
    const response = await this.responseBuilder.getResponse({
      query,
      textChunks,
      parentEvent,
    });
    return new Response(response, nodes);
  }
}
