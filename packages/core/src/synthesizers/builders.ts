import type { Event } from "../callbacks/CallbackManager.js";
import type { LLM } from "../llm/index.js";
import { streamConverter } from "../llm/utils.js";
import {
  defaultRefinePrompt,
  defaultTextQaPrompt,
  defaultTreeSummarizePrompt,
} from "../Prompt.js";
import type { PromptHelper } from "../PromptHelper.js";
import { getBiggestPrompt } from "../PromptHelper.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type { ServiceContext } from "../ServiceContext.js";
import type {
  ResponseBuilder,
  ResponseBuilderParamsNonStreaming,
  ResponseBuilderParamsStreaming,
} from "./types.js";

import { Prompt } from "../index.js";

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
  textQATemplate: Prompt;

  constructor(serviceContext: ServiceContext, textQATemplate?: Prompt) {
    this.llm = serviceContext.llm;
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
  }

  getResponse(
    params: ResponseBuilderParamsStreaming,
  ): Promise<AsyncIterable<string>>;
  getResponse(params: ResponseBuilderParamsNonStreaming): Promise<string>;
  async getResponse({
    query,
    textChunks,
    parentEvent,
    stream,
  }:
    | ResponseBuilderParamsStreaming
    | ResponseBuilderParamsNonStreaming): Promise<
    AsyncIterable<string> | string
  > {
    const input = {
      query,
      context: textChunks.join("\n\n"),
    };

    const prompt = this.textQATemplate.format(input);

    if (stream) {
      const response = await this.llm.complete({ prompt, parentEvent, stream });
      return streamConverter(response, (chunk) => chunk.text);
    } else {
      const response = await this.llm.complete({ prompt, parentEvent, stream });
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
  textQATemplate: Prompt;
  refineTemplate: Prompt;

  constructor(
    serviceContext: ServiceContext,
    textQATemplate?: Prompt,
    refineTemplate?: Prompt,
  ) {
    super();

    this.llm = serviceContext.llm;
    this.promptHelper = serviceContext.promptHelper;
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
    this.refineTemplate = refineTemplate ?? defaultRefinePrompt;
  }

  protected _getPrompts(): {
    textQATemplate: Prompt;
    refineTemplate: Prompt;
  } {
    return {
      textQATemplate: this.textQATemplate,
      refineTemplate: this.refineTemplate,
    };
  }

  protected _updatePrompts(prompts: {
    textQATemplate: Prompt;
    refineTemplate: Prompt;
  }): void {
    if (prompts.textQATemplate) {
      this.textQATemplate = prompts.textQATemplate;
    }

    if (prompts.refineTemplate) {
      this.refineTemplate = prompts.refineTemplate;
    }
  }

  getResponse(
    params: ResponseBuilderParamsStreaming,
  ): Promise<AsyncIterable<string>>;
  getResponse(params: ResponseBuilderParamsNonStreaming): Promise<string>;
  async getResponse({
    query,
    textChunks,
    parentEvent,
    prevResponse,
    stream,
  }:
    | ResponseBuilderParamsStreaming
    | ResponseBuilderParamsNonStreaming): Promise<
    AsyncIterable<string> | string
  > {
    let response: AsyncIterable<string> | string | undefined = prevResponse;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const lastChunk = i === textChunks.length - 1;
      if (!response) {
        response = await this.giveResponseSingle(
          query,
          chunk,
          !!stream && lastChunk,
          parentEvent,
        );
      } else {
        response = await this.refineResponseSingle(
          response as string,
          query,
          chunk,
          !!stream && lastChunk,
          parentEvent,
        );
      }
    }

    return response ?? "Empty Response";
  }

  private async giveResponseSingle(
    queryStr: string,
    textChunk: string,
    stream: boolean,
    parentEvent?: Event,
  ) {
    const textChunks = this.promptHelper.repack(this.textQATemplate, [
      textChunk,
    ]);

    let response: AsyncIterable<string> | string | undefined = undefined;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const lastChunk = i === textChunks.length - 1;

      const prompt = this.textQATemplate.partial({
        context: chunk,
        query: queryStr,
      });

      if (!response) {
        response = await this.complete({
          prompt: prompt,
          parentEvent,
          stream: stream && lastChunk,
        });
      } else {
        response = await this.refineResponseSingle(
          response as string,
          queryStr,
          chunk,
          stream && lastChunk,
          parentEvent,
        );
      }
    }

    return response;
  }

  // eslint-disable-next-line max-params
  private async refineResponseSingle(
    initialReponse: string,
    queryStr: string,
    textChunk: string,
    stream: boolean,
    parentEvent?: Event,
  ) {
    const textChunks = this.promptHelper.repack(this.refineTemplate, [
      textChunk,
    ]);

    let response: AsyncIterable<string> | string = initialReponse;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const lastChunk = i === textChunks.length - 1;

      const prompt = this.refineTemplate.partial({
        context: chunk,
        existingAnswer: response as string,
        query: queryStr,
      });

      response = await this.complete({
        prompt,
        parentEvent,
        stream: stream && lastChunk,
      });
    }
    return response;
  }

  async complete(params: {
    prompt: Prompt;
    stream: boolean;
    parentEvent?: Event;
  }): Promise<AsyncIterable<string> | string> {
    if (params.stream) {
      const response = await this.llm.predict({ ...params, stream: true });
      return streamConverter(response, (chunk) => chunk.text);
    } else {
      const response = await this.llm.predict({ ...params, stream: false });
      return response.text;
    }
  }
}

/**
 * CompactAndRefine is a slight variation of Refine that first compacts the text chunks into the smallest possible number of chunks.
 */
export class CompactAndRefine extends Refine {
  getResponse(
    params: ResponseBuilderParamsStreaming,
  ): Promise<AsyncIterable<string>>;
  getResponse(params: ResponseBuilderParamsNonStreaming): Promise<string>;
  async getResponse({
    query,
    textChunks,
    parentEvent,
    prevResponse,
    stream,
  }:
    | ResponseBuilderParamsStreaming
    | ResponseBuilderParamsNonStreaming): Promise<
    AsyncIterable<string> | string
  > {
    const maxPrompt = getBiggestPrompt([
      this.textQATemplate,
      this.refineTemplate,
    ]);
    const newTexts = this.promptHelper.repack(maxPrompt, textChunks);
    const params = {
      query,
      textChunks: newTexts,
      parentEvent,
      prevResponse,
    };
    if (stream) {
      return super.getResponse({
        ...params,
        stream,
      });
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
  summaryTemplate: Prompt;

  constructor(serviceContext: ServiceContext, summaryTemplate?: Prompt) {
    super();

    this.llm = serviceContext.llm;
    this.promptHelper = serviceContext.promptHelper;
    this.summaryTemplate = summaryTemplate ?? defaultTreeSummarizePrompt;
  }

  protected _getPrompts(): { summaryTemplate: Prompt } {
    return {
      summaryTemplate: this.summaryTemplate,
    };
  }

  protected _updatePrompts(prompts: { summaryTemplate: Prompt }): void {
    if (prompts.summaryTemplate) {
      this.summaryTemplate = prompts.summaryTemplate;
    }
  }

  getResponse(
    params: ResponseBuilderParamsStreaming,
  ): Promise<AsyncIterable<string>>;
  getResponse(params: ResponseBuilderParamsNonStreaming): Promise<string>;
  async getResponse({
    query,
    textChunks,
    parentEvent,
    stream,
  }:
    | ResponseBuilderParamsStreaming
    | ResponseBuilderParamsNonStreaming): Promise<
    AsyncIterable<string> | string
  > {
    if (!textChunks || textChunks.length === 0) {
      throw new Error("Must have at least one text chunk");
    }

    // Should we send the query here too?
    const packedTextChunks = this.promptHelper.repack(
      this.summaryTemplate,
      textChunks,
    );

    if (packedTextChunks.length === 1) {
      const prompt = this.summaryTemplate.partial({
        context: packedTextChunks[0],
        query,
      });

      const params = {
        prompt,
        parentEvent,
      };
      if (stream) {
        const response = await this.llm.complete({ ...params, stream });
        return streamConverter(response, (chunk) => chunk.text);
      }
      return (await this.llm.complete(params)).text;
    } else {
      const summaries = await Promise.all(
        packedTextChunks.map((chunk) => {
          const prompt = this.summaryTemplate.partial({
            context: chunk,
            query,
          });
          return this.llm.complete({ prompt, parentEvent });
        }),
      );

      const params = {
        query,
        textChunks: summaries.map((s) => s.text),
      };

      if (stream) {
        return this.getResponse({
          ...params,
          stream,
        });
      }
      return this.getResponse(params);
    }
  }
}

export function getResponseBuilder(
  serviceContext: ServiceContext,
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

export type ResponseBuilderPrompts = Prompt | Prompt;
