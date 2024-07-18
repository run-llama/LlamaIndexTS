import type { LLM } from "@llamaindex/core/llms";
import type { QueryType } from "@llamaindex/core/query-engine";
import { extractText, streamConverter } from "@llamaindex/core/utils";
import type {
  RefinePrompt,
  SimplePrompt,
  TextQaPrompt,
  TreeSummarizePrompt,
} from "../Prompt.js";
import {
  defaultRefinePrompt,
  defaultTextQaPrompt,
  defaultTreeSummarizePrompt,
} from "../Prompt.js";
import type { PromptHelper } from "../PromptHelper.js";
import { getBiggestPrompt } from "../PromptHelper.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type { ServiceContext } from "../ServiceContext.js";
import {
  llmFromSettingsOrContext,
  promptHelperFromSettingsOrContext,
} from "../Settings.js";
import type { ResponseBuilder, ResponseBuilderQuery } from "./types.js";

/**
 * Response modes of the response synthesizer
 */
enum ResponseMode {
  REFINE = "refine",
  COMPACT = "compact",
  TREE_SUMMARIZE = "tree_summarize",
  SIMPLE = "simple",
}

/**
 * A response builder that just concatenates responses.
 */
export class SimpleResponseBuilder implements ResponseBuilder {
  llm: LLM;
  textQATemplate: TextQaPrompt;

  constructor(serviceContext?: ServiceContext, textQATemplate?: TextQaPrompt) {
    this.llm = llmFromSettingsOrContext(serviceContext);
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
  }

  getResponse(
    query: ResponseBuilderQuery,
    stream: true,
  ): Promise<AsyncIterable<string>>;
  getResponse(query: ResponseBuilderQuery, stream?: false): Promise<string>;
  async getResponse(
    { query, textChunks }: ResponseBuilderQuery,
    stream?: boolean,
  ): Promise<AsyncIterable<string> | string> {
    const input = {
      query: extractText(query),
      context: textChunks.join("\n\n"),
    };

    const prompt = this.textQATemplate(input);
    if (stream) {
      const response = await this.llm.complete({ prompt, stream });
      return streamConverter(response, (chunk) => chunk.text);
    } else {
      const response = await this.llm.complete({ prompt, stream });
      return response.text;
    }
  }
}

/**
 * A response builder that uses the query to ask the LLM generate a better response using multiple text chunks.
 */
export class Refine extends PromptMixin implements ResponseBuilder {
  llm: LLM;
  promptHelper: PromptHelper;
  textQATemplate: TextQaPrompt;
  refineTemplate: RefinePrompt;

  constructor(
    serviceContext?: ServiceContext,
    textQATemplate?: TextQaPrompt,
    refineTemplate?: RefinePrompt,
  ) {
    super();

    this.llm = llmFromSettingsOrContext(serviceContext);
    this.promptHelper = promptHelperFromSettingsOrContext(serviceContext);
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
    this.refineTemplate = refineTemplate ?? defaultRefinePrompt;
  }

  protected _getPrompts(): {
    textQATemplate: RefinePrompt;
    refineTemplate: RefinePrompt;
  } {
    return {
      textQATemplate: this.textQATemplate,
      refineTemplate: this.refineTemplate,
    };
  }

  protected _updatePrompts(prompts: {
    textQATemplate: RefinePrompt;
    refineTemplate: RefinePrompt;
  }): void {
    if (prompts.textQATemplate) {
      this.textQATemplate = prompts.textQATemplate;
    }

    if (prompts.refineTemplate) {
      this.refineTemplate = prompts.refineTemplate;
    }
  }

  getResponse(
    query: ResponseBuilderQuery,
    stream: true,
  ): Promise<AsyncIterable<string>>;
  getResponse(query: ResponseBuilderQuery, stream?: false): Promise<string>;
  async getResponse(
    { query, textChunks, prevResponse }: ResponseBuilderQuery,
    stream?: boolean,
  ): Promise<AsyncIterable<string> | string> {
    let response: AsyncIterable<string> | string | undefined = prevResponse;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const lastChunk = i === textChunks.length - 1;
      if (!response) {
        response = await this.giveResponseSingle(
          query,
          chunk,
          !!stream && lastChunk,
        );
      } else {
        response = await this.refineResponseSingle(
          response as string,
          query,
          chunk,
          !!stream && lastChunk,
        );
      }
    }

    return response ?? "Empty Response";
  }

  private async giveResponseSingle(
    query: QueryType,
    textChunk: string,
    stream: boolean,
  ) {
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({ ...input, query: extractText(query) });
    const textChunks = this.promptHelper.repack(textQATemplate, [textChunk]);

    let response: AsyncIterable<string> | string | undefined = undefined;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const lastChunk = i === textChunks.length - 1;
      if (!response) {
        response = await this.complete({
          prompt: textQATemplate({
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

    return response;
  }

  // eslint-disable-next-line max-params
  private async refineResponseSingle(
    initialReponse: string,
    query: QueryType,
    textChunk: string,
    stream: boolean,
  ) {
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({ ...input, query: extractText(query) });

    const textChunks = this.promptHelper.repack(refineTemplate, [textChunk]);

    let response: AsyncIterable<string> | string = initialReponse;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const lastChunk = i === textChunks.length - 1;
      response = await this.complete({
        prompt: refineTemplate({
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
export class CompactAndRefine extends Refine {
  getResponse(
    query: ResponseBuilderQuery,
    stream: true,
  ): Promise<AsyncIterable<string>>;
  getResponse(query: ResponseBuilderQuery, stream?: false): Promise<string>;
  async getResponse(
    { query, textChunks, prevResponse }: ResponseBuilderQuery,
    stream?: boolean,
  ): Promise<AsyncIterable<string> | string> {
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({
        ...input,
        query: extractText(query),
      });
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({
        ...input,
        query: extractText(query),
      });

    const maxPrompt = getBiggestPrompt([textQATemplate, refineTemplate]);
    const newTexts = this.promptHelper.repack(maxPrompt, textChunks);
    const params = {
      query,
      textChunks: newTexts,
      prevResponse,
    };
    if (stream) {
      return super.getResponse(
        {
          ...params,
        },
        true,
      );
    }
    return super.getResponse(params);
  }
}

/**
 * TreeSummarize repacks the text chunks into the smallest possible number of chunks and then summarizes them, then recursively does so until there's one chunk left.
 */
export class TreeSummarize extends PromptMixin implements ResponseBuilder {
  llm: LLM;
  promptHelper: PromptHelper;
  summaryTemplate: TreeSummarizePrompt;

  constructor(
    serviceContext?: ServiceContext,
    summaryTemplate?: TreeSummarizePrompt,
  ) {
    super();

    this.llm = llmFromSettingsOrContext(serviceContext);
    this.promptHelper = promptHelperFromSettingsOrContext(serviceContext);
    this.summaryTemplate = summaryTemplate ?? defaultTreeSummarizePrompt;
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

  getResponse(
    query: ResponseBuilderQuery,
    stream: true,
  ): Promise<AsyncIterable<string>>;
  getResponse(query: ResponseBuilderQuery, stream?: false): Promise<string>;
  async getResponse(
    { query, textChunks }: ResponseBuilderQuery,
    stream?: boolean,
  ): Promise<AsyncIterable<string> | string> {
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
        prompt: this.summaryTemplate({
          context: packedTextChunks[0],
          query: extractText(query),
        }),
      };
      if (stream) {
        const response = await this.llm.complete({ ...params, stream });
        return streamConverter(response, (chunk) => chunk.text);
      }
      return (await this.llm.complete(params)).text;
    } else {
      const summaries = await Promise.all(
        packedTextChunks.map((chunk) =>
          this.llm.complete({
            prompt: this.summaryTemplate({
              context: chunk,
              query: extractText(query),
            }),
          }),
        ),
      );

      const params = {
        query,
        textChunks: summaries.map((s) => s.text),
      };
      if (stream) {
        return this.getResponse(
          {
            ...params,
          },
          true,
        );
      }
      return this.getResponse(params);
    }
  }
}

export function getResponseBuilder(
  serviceContext?: ServiceContext,
  responseMode?: ResponseMode,
): ResponseBuilder {
  switch (responseMode) {
    case ResponseMode.SIMPLE:
      return new SimpleResponseBuilder(serviceContext);
    case ResponseMode.REFINE:
      return new Refine(serviceContext);
    case ResponseMode.TREE_SUMMARIZE:
      return new TreeSummarize(serviceContext);
    default:
      return new CompactAndRefine(serviceContext);
  }
}

export type ResponseBuilderPrompts =
  | TextQaPrompt
  | TreeSummarizePrompt
  | RefinePrompt;
