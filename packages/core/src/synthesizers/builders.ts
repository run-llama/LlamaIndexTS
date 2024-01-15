import { Event } from "../callbacks/CallbackManager";
import { LLM } from "../llm";
import { streamConverter } from "../llm/utils";
import {
  defaultRefinePrompt,
  defaultTextQaPrompt,
  defaultTreeSummarizePrompt,
  RefinePrompt,
  SimplePrompt,
  TextQaPrompt,
  TreeSummarizePrompt,
} from "../Prompt";
import { getBiggestPrompt, PromptHelper } from "../PromptHelper";
import { ServiceContext } from "../ServiceContext";
import {
  ResponseBuilder,
  ResponseBuilderParamsNonStreaming,
  ResponseBuilderParamsStreaming,
} from "./types";

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
  textQATemplate: SimplePrompt;

  constructor(serviceContext: ServiceContext) {
    this.llm = serviceContext.llm;
    this.textQATemplate = defaultTextQaPrompt;
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

    const prompt = this.textQATemplate(input);
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
export class Refine implements ResponseBuilder {
  llm: LLM;
  promptHelper: PromptHelper;
  textQATemplate: TextQaPrompt;
  refineTemplate: RefinePrompt;

  constructor(
    serviceContext: ServiceContext,
    textQATemplate?: TextQaPrompt,
    refineTemplate?: RefinePrompt,
  ) {
    this.llm = serviceContext.llm;
    this.promptHelper = serviceContext.promptHelper;
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
    this.refineTemplate = refineTemplate ?? defaultRefinePrompt;
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
    if (stream) {
      throw new Error("streaming not implemented");
    }
    let response: string | undefined = undefined;

    for (const chunk of textChunks) {
      if (!prevResponse) {
        response = await this.giveResponseSingle(query, chunk, parentEvent);
      } else {
        response = await this.refineResponseSingle(
          prevResponse,
          query,
          chunk,
          parentEvent,
        );
      }
      prevResponse = response;
    }

    return response ?? "Empty Response";
  }

  private async giveResponseSingle(
    queryStr: string,
    textChunk: string,
    parentEvent?: Event,
  ): Promise<string> {
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({ ...input, query: queryStr });
    const textChunks = this.promptHelper.repack(textQATemplate, [textChunk]);

    let response: string | undefined = undefined;

    for (const chunk of textChunks) {
      if (!response) {
        response = (
          await this.llm.complete({
            prompt: textQATemplate({
              context: chunk,
            }),
            parentEvent,
          })
        ).text;
      } else {
        response = await this.refineResponseSingle(
          response,
          queryStr,
          chunk,
          parentEvent,
        );
      }
    }

    return response ?? "Empty Response";
  }

  private async refineResponseSingle(
    response: string,
    queryStr: string,
    textChunk: string,
    parentEvent?: Event,
  ) {
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({ ...input, query: queryStr });

    const textChunks = this.promptHelper.repack(refineTemplate, [textChunk]);

    for (const chunk of textChunks) {
      response = (
        await this.llm.complete({
          prompt: refineTemplate({
            context: chunk,
            existingAnswer: response,
          }),
          parentEvent,
        })
      ).text;
    }
    return response;
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
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({ ...input, query: query });
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({ ...input, query: query });

    const maxPrompt = getBiggestPrompt([textQATemplate, refineTemplate]);
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
export class TreeSummarize implements ResponseBuilder {
  llm: LLM;
  promptHelper: PromptHelper;
  summaryTemplate: TreeSummarizePrompt;

  constructor(
    serviceContext: ServiceContext,
    summaryTemplate?: TreeSummarizePrompt,
  ) {
    this.llm = serviceContext.llm;
    this.promptHelper = serviceContext.promptHelper;
    this.summaryTemplate = summaryTemplate ?? defaultTreeSummarizePrompt;
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
      const params = {
        prompt: this.summaryTemplate({
          context: packedTextChunks[0],
          query,
        }),
        parentEvent,
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
              query,
            }),
            parentEvent,
          }),
        ),
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
