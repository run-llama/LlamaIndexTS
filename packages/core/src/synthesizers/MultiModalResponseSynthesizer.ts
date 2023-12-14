import { MessageContentDetail } from "../ChatEngine";
import { MetadataMode, NodeWithScore, splitNodesByType } from "../Node";
import { Response } from "../Response";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { Event } from "../callbacks/CallbackManager";
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
    // TODO: get images from imageNodes
    const prompt: MessageContentDetail[] = [
      { type: "text", text: textPrompt },
      {
        type: "image_url",
        image_url: {
          url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Vincent_van_Gogh_%281853-1890%29_Caf%C3%A9terras_bij_nacht_%28place_du_Forum%29_Kr%C3%B6ller-M%C3%BCller_Museum_Otterlo_23-8-2016_13-35-40.JPG",
        },
      },
    ];
    let response = await this.serviceContext.llm.complete(prompt, parentEvent);
    return new Response(response.message.content, nodes);
  }
}
