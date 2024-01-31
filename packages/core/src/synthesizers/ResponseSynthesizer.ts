import { MetadataMode } from "../Node";
import { Response } from "../Response";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { streamConverter } from "../llm/utils";
import { getResponseBuilder } from "./builders";
import {
  BaseSynthesizer,
  ResponseBuilder,
  SynthesizeParamsNonStreaming,
  SynthesizeParamsStreaming,
} from "./types";

/**
 * A ResponseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export class ResponseSynthesizer implements BaseSynthesizer {
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
    this.serviceContext = serviceContext ?? serviceContextFromDefaults();
    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(this.serviceContext);
    this.metadataMode = metadataMode;
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
