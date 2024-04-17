import type { ImageNode } from "../Node.js";
import { MetadataMode, splitNodesByType } from "../Node.js";
import { Response } from "../Response.js";
import type { ServiceContext } from "../ServiceContext.js";
import { llmFromSettingsOrContext } from "../Settings.js";
import { imageToDataUrl } from "../embeddings/index.js";
import { toQueryBundle } from "../internal/utils.js";
import type { MessageContentDetail } from "../llm/index.js";
import { extractImage, extractText } from "../llm/utils.js";
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
    const { imageNodes, textNodes } = splitNodesByType(nodes);
    const textChunks = textNodes.map((node) =>
      node.getContent(this.metadataMode),
    );
    // TODO: use builders to generate context
    const context = textChunks.join("\n\n");
    const textPrompt = this.textQATemplate({
      context,
      query: extractText(toQueryBundle(query).query),
    });
    const images = await Promise.all(
      imageNodes.map(async (node: ImageNode) => {
        return {
          type: "image_url",
          image_url: {
            url: await imageToDataUrl(node.image),
          },
        } satisfies MessageContentDetail;
      }),
    );
    const prompt: MessageContentDetail[] = [
      ...extractImage(toQueryBundle(query).query),
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
