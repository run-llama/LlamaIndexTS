import { MetadataMode } from "../Node.js";
import { Response } from "../Response.js";
import type { ServiceContext } from "../ServiceContext.js";
import { llmFromSettingsOrContext } from "../Settings.js";
import { streamConverter } from "../llm/utils.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type { TextQaPrompt } from "./../Prompt.js";
import { defaultTextQaPrompt } from "./../Prompt.js";
import type {
  BaseSynthesizer,
  SynthesizeParamsNonStreaming,
  SynthesizeParamsStreaming,
} from "./types.js";
import { createMessageContent } from "./utils.js";

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
    const nodes = nodesWithScore.map(({ node }) => node);
    const prompt = await createMessageContent(
      this.textQATemplate,
      nodes,
      { query },
      this.metadataMode,
    );

    const llm = llmFromSettingsOrContext(this.serviceContext);

    if (stream) {
      const response = await llm.complete({
        prompt,
        stream,
      });
      return streamConverter(
        response,
        ({ text }) => new Response(text, nodesWithScore),
      );
    }
    const response = await llm.complete({
      prompt,
    });
    return new Response(response.text, nodesWithScore);
  }
}
