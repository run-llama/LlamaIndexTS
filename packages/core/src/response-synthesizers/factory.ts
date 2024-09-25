import { z } from "zod";
import { getBiggestPrompt } from "../indices";
import type { MessageContent } from "../llms";
import {
  defaultRefinePrompt,
  defaultTextQAPrompt,
  defaultTreeSummarizePrompt,
  type ModuleRecord,
  type RefinePrompt,
  type TextQAPrompt,
  type TreeSummarizePrompt,
} from "../prompts";
import {
  EngineResponse,
  MetadataMode,
  type NodeWithScore,
  TextNode,
} from "../schema";
import { extractText, streamConverter } from "../utils";
import {
  BaseSynthesizer,
  type BaseSynthesizerOptions,
} from "./base-synthesizer";
import { createMessageContent } from "./utils";

const responseModeSchema = z.enum([
  "refine",
  "compact",
  "tree_summarize",
  "multi_modal",
]);

export type ResponseMode = z.infer<typeof responseModeSchema>;

/**
 * A response builder that uses the query to ask the LLM generate a better response using multiple text chunks.
 */
class Refine extends BaseSynthesizer {
  textQATemplate: TextQAPrompt;
  refineTemplate: RefinePrompt;

  constructor(
    options: BaseSynthesizerOptions & {
      textQATemplate?: TextQAPrompt | undefined;
      refineTemplate?: RefinePrompt | undefined;
    },
  ) {
    super(options);
    this.textQATemplate = options.textQATemplate ?? defaultTextQAPrompt;
    this.refineTemplate = options.refineTemplate ?? defaultRefinePrompt;
  }

  protected _getPromptModules(): ModuleRecord {
    return {};
  }

  protected _getPrompts(): {
    textQATemplate: TextQAPrompt;
    refineTemplate: RefinePrompt;
  } {
    return {
      textQATemplate: this.textQATemplate,
      refineTemplate: this.refineTemplate,
    };
  }

  protected _updatePrompts(prompts: {
    textQATemplate: TextQAPrompt;
    refineTemplate: RefinePrompt;
  }): void {
    if (prompts.textQATemplate) {
      this.textQATemplate = prompts.textQATemplate;
    }

    if (prompts.refineTemplate) {
      this.refineTemplate = prompts.refineTemplate;
    }
  }

  async getResponse(
    query: MessageContent,
    nodes: NodeWithScore[],
    stream: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    let response: AsyncIterable<string> | string | undefined = undefined;
    const textChunks = nodes.map(({ node }) =>
      node.getContent(MetadataMode.LLM),
    );

    for (let i = 0; i < textChunks.length; i++) {
      const text = textChunks[i]!;
      const lastChunk = i === textChunks.length - 1;
      if (!response) {
        response = await this.giveResponseSingle(
          query,
          text,
          !!stream && lastChunk,
        );
      } else {
        response = await this.refineResponseSingle(
          response as string,
          query,
          text,
          !!stream && lastChunk,
        );
      }
    }

    // fixme: no source nodes provided, cannot fix right now due to lack of context
    if (typeof response === "string") {
      return EngineResponse.fromResponse(response, false);
    } else {
      return streamConverter(response!, (text) =>
        EngineResponse.fromResponse(text, true),
      );
    }
  }

  private async giveResponseSingle(
    query: MessageContent,
    textChunk: string,
    stream: boolean,
  ): Promise<AsyncIterable<string> | string> {
    const textQATemplate: TextQAPrompt = this.textQATemplate.partialFormat({
      query: extractText(query),
    });
    const textChunks = this.promptHelper.repack(textQATemplate, [textChunk]);

    let response: AsyncIterable<string> | string | undefined = undefined;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]!;
      const lastChunk = i === textChunks.length - 1;
      if (!response) {
        response = await this.complete({
          prompt: textQATemplate.format({
            context: chunk,
          }),
          stream: stream && lastChunk,
        });
      } else {
        response = await this.refineResponseSingle(
          response as string,
          query,
          chunk,
          stream && lastChunk,
        );
      }
    }

    return response as AsyncIterable<string> | string;
  }

  // eslint-disable-next-line max-params
  private async refineResponseSingle(
    initialReponse: string,
    query: MessageContent,
    textChunk: string,
    stream: boolean,
  ): Promise<AsyncIterable<string> | string> {
    const refineTemplate: RefinePrompt = this.refineTemplate.partialFormat({
      query: extractText(query),
    });

    const textChunks = this.promptHelper.repack(refineTemplate, [textChunk]);

    let response: AsyncIterable<string> | string = initialReponse;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]!;
      const lastChunk = i === textChunks.length - 1;
      response = await this.complete({
        prompt: refineTemplate.format({
          context: chunk,
          existingAnswer: response as string,
        }),
        stream: stream && lastChunk,
      });
    }
    return response;
  }

  async complete(params: {
    prompt: string;
    stream: boolean;
  }): Promise<AsyncIterable<string> | string> {
    if (params.stream) {
      const response = await this.llm.complete({ ...params, stream: true });
      return streamConverter(response, (chunk) => chunk.text);
    } else {
      const response = await this.llm.complete({ ...params, stream: false });
      return response.text;
    }
  }
}

/**
 * CompactAndRefine is a slight variation of Refine that first compacts the text chunks into the smallest possible number of chunks.
 */
class CompactAndRefine extends Refine {
  async getResponse(
    query: MessageContent,
    nodes: NodeWithScore[],
    stream: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const textQATemplate: TextQAPrompt = this.textQATemplate.partialFormat({
      query: extractText(query),
    });
    const refineTemplate: RefinePrompt = this.refineTemplate.partialFormat({
      query: extractText(query),
    });
    const textChunks = nodes.map(({ node }) =>
      node.getContent(MetadataMode.LLM),
    );

    const maxPrompt = getBiggestPrompt([textQATemplate, refineTemplate]);
    const newTexts = this.promptHelper.repack(maxPrompt, textChunks);
    const newNodes = newTexts.map((text) => new TextNode({ text }));
    if (stream) {
      return super.getResponse(
        query,
        newNodes.map((node) => ({ node })),
        true,
      );
    }
    return super.getResponse(
      query,
      newNodes.map((node) => ({ node })),
      false,
    );
  }
}

/**
 * TreeSummarize repacks the text chunks into the smallest possible number of chunks and then summarizes them, then recursively does so until there's one chunk left.
 */
class TreeSummarize extends BaseSynthesizer {
  summaryTemplate: TreeSummarizePrompt;

  constructor(
    options: BaseSynthesizerOptions & {
      summaryTemplate?: TreeSummarizePrompt;
    },
  ) {
    super(options);
    this.summaryTemplate =
      options.summaryTemplate ?? defaultTreeSummarizePrompt;
  }

  protected _getPromptModules(): ModuleRecord {
    return {};
  }

  protected _getPrompts(): { summaryTemplate: TreeSummarizePrompt } {
    return {
      summaryTemplate: this.summaryTemplate,
    };
  }

  protected _updatePrompts(prompts: {
    summaryTemplate: TreeSummarizePrompt;
  }): void {
    if (prompts.summaryTemplate) {
      this.summaryTemplate = prompts.summaryTemplate;
    }
  }

  async getResponse(
    query: MessageContent,
    nodes: NodeWithScore[],
    stream: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const textChunks = nodes.map(({ node }) =>
      node.getContent(MetadataMode.LLM),
    );
    if (!textChunks || textChunks.length === 0) {
      throw new Error("Must have at least one text chunk");
    }

    // Should we send the query here too?
    const packedTextChunks = this.promptHelper.repack(
      this.summaryTemplate,
      textChunks,
    );

    if (packedTextChunks.length === 1) {
      const params = {
        prompt: this.summaryTemplate.format({
          context: packedTextChunks[0]!,
          query: extractText(query),
        }),
      };
      if (stream) {
        const response = await this.llm.complete({ ...params, stream });
        return streamConverter(response, (chunk) =>
          EngineResponse.fromResponse(chunk.text, true),
        );
      }
      return EngineResponse.fromResponse(
        (await this.llm.complete(params)).text,
        false,
      );
    } else {
      const summaries = await Promise.all(
        packedTextChunks.map((chunk) =>
          this.llm.complete({
            prompt: this.summaryTemplate.format({
              context: chunk,
              query: extractText(query),
            }),
          }),
        ),
      );

      if (stream) {
        return this.getResponse(
          query,
          summaries.map((s) => ({
            node: new TextNode({
              text: s.text,
            }),
          })),
          true,
        );
      }
      return this.getResponse(
        query,
        summaries.map((s) => ({
          node: new TextNode({
            text: s.text,
          }),
        })),
        false,
      );
    }
  }
}

class MultiModal extends BaseSynthesizer {
  metadataMode: MetadataMode;
  textQATemplate: TextQAPrompt;

  constructor({
    textQATemplate,
    metadataMode,
    ...options
  }: BaseSynthesizerOptions & {
    textQATemplate?: TextQAPrompt;
    metadataMode?: MetadataMode;
  } = {}) {
    super(options);

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

  protected async getResponse(
    query: MessageContent,
    nodes: NodeWithScore[],
    stream: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const prompt = await createMessageContent(
      this.textQATemplate,
      nodes.map(({ node }) => node),
      // this might not be good as this remove the image information
      { query: extractText(query) },
      this.metadataMode,
    );

    const llm = this.llm;

    if (stream) {
      const response = await llm.complete({
        prompt,
        stream,
      });
      return streamConverter(response, ({ text }) =>
        EngineResponse.fromResponse(text, true),
      );
    }
    const response = await llm.complete({
      prompt,
    });
    return EngineResponse.fromResponse(response.text, false);
  }
}

export function getResponseSynthesizer(
  mode: ResponseMode,
  options: BaseSynthesizerOptions & {
    textQATemplate?: TextQAPrompt;
    refineTemplate?: RefinePrompt;
    summaryTemplate?: TreeSummarizePrompt;
    metadataMode?: MetadataMode;
  } = {},
) {
  switch (mode) {
    case "compact": {
      return new CompactAndRefine(options);
    }
    case "refine": {
      return new Refine(options);
    }
    case "tree_summarize": {
      return new TreeSummarize(options);
    }
    case "multi_modal": {
      return new MultiModal(options);
    }
  }
}
