import type { ImageNode } from "../Node.js";
import { MetadataMode, ModalityType, splitNodesByType } from "../Node.js";
import { Response } from "../Response.js";
import type { ServiceContext } from "../ServiceContext.js";
import { llmFromSettingsOrContext } from "../Settings.js";
import { imageToDataUrl } from "../embeddings/index.js";
import type { MessageContentDetail } from "../llm/types.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type { TextQaPrompt } from "./../Prompt.js";
import { defaultTextQaPrompt } from "./../Prompt.js";
import type {
  BaseSynthesizer,
  SynthesizeParamsNonStreaming,
  SynthesizeParamsStreaming,
} from "./types.js";

export class MultiModalResponseSynthesizer
  extends PromptMixin
  implements BaseSynthesizer
{
  serviceContext?: ServiceContext;
  metadataMode: MetadataMode;
  textQATemplate: TextQaPrompt;

  constructor({
    serviceContext,
    textQATemplate,
    metadataMode,
  }: Partial<MultiModalResponseSynthesizer> = {}) {
    super();

    this.serviceContext = serviceContext;
    this.metadataMode = metadataMode ?? MetadataMode.NONE;
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
  }

  protected _getPrompts(): { textQATemplate: TextQaPrompt } {
    return {
      textQATemplate: this.textQATemplate,
    };
  }

  protected _updatePrompts(promptsDict: {
    textQATemplate: TextQaPrompt;
  }): void {
    if (promptsDict.textQATemplate) {
      this.textQATemplate = promptsDict.textQATemplate;
    }
  }

  synthesize(
    params: SynthesizeParamsStreaming,
  ): Promise<AsyncIterable<Response>>;
  synthesize(params: SynthesizeParamsNonStreaming): Promise<Response>;
  async synthesize({
    query,
    nodesWithScore,
    stream,
  }: SynthesizeParamsStreaming | SynthesizeParamsNonStreaming): Promise<
    AsyncIterable<Response> | Response
  > {
    if (stream) {
      throw new Error("streaming not implemented");
    }
    const nodes = nodesWithScore.map(({ node }) => node);
    const nodeMap = splitNodesByType(nodes);
    const imageNodes: ImageNode[] =
      (nodeMap[ModalityType.IMAGE] as ImageNode[]) ?? [];
    const textNodes = nodeMap[ModalityType.TEXT] ?? [];
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

    const llm = llmFromSettingsOrContext(this.serviceContext);

    const response = await llm.complete({
      prompt,
    });

    return new Response(response.text, nodesWithScore);
  }
}
