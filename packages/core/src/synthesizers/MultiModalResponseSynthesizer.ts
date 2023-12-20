import { MessageContentDetail } from "../ChatEngine";
import {
  ImageNode,
  MetadataMode,
  NodeWithScore,
  splitNodesByType,
} from "../Node";
import { Response } from "../Response";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { Event } from "../callbacks/CallbackManager";
import { imageToDataUrl } from "../embeddings";
import { TextQaPrompt, defaultTextQaPrompt } from "./../Prompt";
import { BaseSynthesizer } from "./types";

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

  async synthesize(
    query: string,
    nodesWithScore: NodeWithScore[],
    parentEvent?: Event,
  ): Promise<Response> {
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
    let response = await this.serviceContext.llm.complete(prompt, parentEvent);
    return new Response(response.message.content, nodes);
  }
}
