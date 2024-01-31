import { ImageNode, MetadataMode, splitNodesByType } from "../Node";
import { Response } from "../Response";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { imageToDataUrl } from "../embeddings";
import { MessageContentDetail } from "../llm/types";
import { TextQaPrompt, defaultTextQaPrompt } from "./../Prompt";
import {
  BaseSynthesizer,
  SynthesizeParamsNonStreaming,
  SynthesizeParamsStreaming,
} from "./types";

export class MultiModalResponseSynthesizer implements BaseSynthesizer {
  serviceContext: ServiceContext;
  metadataMode: MetadataMode;
  textQATemplate: TextQaPrompt;

  constructor({
    serviceContext,
    textQATemplate,
    metadataMode,
  }: Partial<MultiModalResponseSynthesizer> = {}) {
    this.serviceContext = serviceContext ?? serviceContextFromDefaults();
    this.metadataMode = metadataMode ?? MetadataMode.NONE;
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
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
    if (stream) {
      throw new Error("streaming not implemented");
    }
    const nodes = nodesWithScore.map(({ node }) => node);
    const { imageNodes, textNodes } = splitNodesByType(nodes);
    const textChunks = textNodes.map((node) =>
      node.getContent(this.metadataMode),
    );
    // TODO: use builders to generate context
    const context = textChunks.join("\n\n");
    const textPrompt = this.textQATemplate({ context, query });
    const images = await Promise.all(
      imageNodes.map(async (node: ImageNode) => {
        return {
          type: "image_url",
          image_url: {
            url: await imageToDataUrl(node.image),
          },
        } as MessageContentDetail;
      }),
    );
    const prompt: MessageContentDetail[] = [
      { type: "text", text: textPrompt },
      ...images,
    ];
    let response = await this.serviceContext.llm.complete({
      prompt,
      parentEvent,
    });
    return new Response(response.text, nodes);
  }
}
