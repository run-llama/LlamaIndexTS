import {
  defaultTextQAPrompt,
  PromptMixin,
  type ModuleRecord,
  type TextQAPrompt,
} from "@llamaindex/core/prompts";
import { EngineResponse, MetadataMode } from "@llamaindex/core/schema";
import { streamConverter } from "@llamaindex/core/utils";
import type { ServiceContext } from "../ServiceContext.js";
import { llmFromSettingsOrContext } from "../Settings.js";
import type { BaseSynthesizer, SynthesizeQuery } from "./types.js";
import { createMessageContent } from "./utils.js";

export class MultiModalResponseSynthesizer
  extends PromptMixin
  implements BaseSynthesizer
{
  serviceContext?: ServiceContext;
  metadataMode: MetadataMode;
  textQATemplate: TextQAPrompt;

  constructor({
    serviceContext,
    textQATemplate,
    metadataMode,
  }: Partial<MultiModalResponseSynthesizer> = {}) {
    super();

    this.serviceContext = serviceContext;
    this.metadataMode = metadataMode ?? MetadataMode.NONE;
    this.textQATemplate = textQATemplate ?? defaultTextQAPrompt;
  }

  protected _getPromptModules(): ModuleRecord {
    return {};
  }

  protected _getPrompts(): { textQATemplate: TextQAPrompt } {
    return {
      textQATemplate: this.textQATemplate,
    };
  }

  protected _updatePrompts(promptsDict: {
    textQATemplate: TextQAPrompt;
  }): void {
    if (promptsDict.textQATemplate) {
      this.textQATemplate = promptsDict.textQATemplate;
    }
  }

  synthesize(
    query: SynthesizeQuery,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  synthesize(query: SynthesizeQuery, stream?: false): Promise<EngineResponse>;
  async synthesize(
    query: SynthesizeQuery,
    stream?: boolean,
  ): Promise<AsyncIterable<EngineResponse> | EngineResponse> {
    const { nodesWithScore } = query;
    const nodes = nodesWithScore.map(({ node }) => node);
    const prompt = await createMessageContent(
      this.textQATemplate,
      nodes,
      // fixme: wtf type is this?
      // { query },
      {},
      this.metadataMode,
    );

    const llm = llmFromSettingsOrContext(this.serviceContext);

    if (stream) {
      const response = await llm.complete({
        prompt,
        stream,
      });
      return streamConverter(response, ({ text }) =>
        EngineResponse.fromResponse(text, true, nodesWithScore),
      );
    }
    const response = await llm.complete({
      prompt,
    });
    return EngineResponse.fromResponse(response.text, false, nodesWithScore);
  }
}
