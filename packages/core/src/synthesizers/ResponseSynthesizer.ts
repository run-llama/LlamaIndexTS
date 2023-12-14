import { Event } from "../callbacks/CallbackManager";
import { MetadataMode, NodeWithScore } from "../Node";
import { Response } from "../Response";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { BaseResponseBuilder, getResponseBuilder } from "./builders";
import { BaseSynthesizer } from "./types";

/**
 * A ResponseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export class ResponseSynthesizer implements BaseSynthesizer {
  responseBuilder: BaseResponseBuilder;
  serviceContext: ServiceContext;
  metadataMode: MetadataMode;

  constructor({
    responseBuilder,
    serviceContext,
    metadataMode = MetadataMode.NONE,
  }: {
    responseBuilder?: BaseResponseBuilder;
    serviceContext?: ServiceContext;
    metadataMode?: MetadataMode;
  } = {}) {
    this.serviceContext = serviceContext ?? serviceContextFromDefaults();
    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(this.serviceContext);
    this.metadataMode = metadataMode;
  }

  async synthesize(
    query: string,
    nodesWithScore: NodeWithScore[],
    parentEvent?: Event,
  ) {
    let textChunks: string[] = nodesWithScore.map(({ node }) =>
      node.getContent(this.metadataMode),
    );
    const response = await this.responseBuilder.getResponse(
      query,
      textChunks,
      parentEvent,
    );
    return new Response(
      response,
      nodesWithScore.map(({ node }) => node),
    );
  }
}
