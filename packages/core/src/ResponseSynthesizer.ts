import { ChatGPTLLMPredictor, BaseLLMPredictor } from "./llm/LLMPredictor";
import { MetadataMode, NodeWithScore } from "./Node";
import {
  SimplePrompt,
  defaultRefinePrompt,
  defaultTextQaPrompt,
} from "./Prompt";
import { getBiggestPrompt } from "./PromptHelper";
import { Response } from "./Response";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";
import { Event } from "./callbacks/CallbackManager";

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
 * A ResponseBuilder is used in a response synthesizer to generate a response from multiple response chunks.
 */
interface BaseResponseBuilder {
  /**
   * Get the response from a query and a list of text chunks.
   * @param query
   * @param textChunks
   * @param parentEvent
   * @param prevResponse
   */
  getResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event,
    prevResponse?: string
  ): Promise<string>;
}

/**
 * A response builder that just concatenates responses.
 */
export class SimpleResponseBuilder implements BaseResponseBuilder {
  llmPredictor: BaseLLMPredictor;
  textQATemplate: SimplePrompt;

  constructor(serviceContext: ServiceContext) {
    this.llmPredictor = serviceContext.llmPredictor;
    this.textQATemplate = defaultTextQaPrompt;
  }

  async getResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event
  ): Promise<string> {
    const input = {
      query,
      context: textChunks.join("\n\n"),
    };

    const prompt = this.textQATemplate(input);
    return this.llmPredictor.predict(prompt, {}, parentEvent);
  }
}

/**
 * A response builder that uses the query to ask the LLM generate a better response using multiple text chunks.
 */
export class Refine implements BaseResponseBuilder {
  serviceContext: ServiceContext;
  textQATemplate: SimplePrompt;
  refineTemplate: SimplePrompt;

  constructor(
    serviceContext: ServiceContext,
    textQATemplate?: SimplePrompt,
    refineTemplate?: SimplePrompt
  ) {
    this.serviceContext = serviceContext;
    this.textQATemplate = textQATemplate ?? defaultTextQaPrompt;
    this.refineTemplate = refineTemplate ?? defaultRefinePrompt;
  }

  async getResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event,
    prevResponse?: string
  ): Promise<string> {
    let response: string | undefined = undefined;

    for (const chunk of textChunks) {
      if (!prevResponse) {
        response = await this.giveResponseSingle(query, chunk, parentEvent);
      } else {
        response = await this.refineResponseSingle(
          prevResponse,
          query,
          chunk,
          parentEvent
        );
      }
      prevResponse = response;
    }

    return response ?? "Empty Response";
  }

  private async giveResponseSingle(
    queryStr: string,
    textChunk: string,
    parentEvent?: Event
  ): Promise<string> {
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({ ...input, query: queryStr });
    const textChunks = this.serviceContext.promptHelper.repack(textQATemplate, [
      textChunk,
    ]);

    let response: string | undefined = undefined;

    for (const chunk of textChunks) {
      if (!response) {
        response = await this.serviceContext.llmPredictor.predict(
          textQATemplate,
          {
            context: chunk,
          },
          parentEvent
        );
      } else {
        response = await this.refineResponseSingle(
          response,
          queryStr,
          chunk,
          parentEvent
        );
      }
    }

    return response ?? "Empty Response";
  }

  private async refineResponseSingle(
    response: string,
    queryStr: string,
    textChunk: string,
    parentEvent?: Event
  ) {
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({ ...input, query: queryStr });

    const textChunks = this.serviceContext.promptHelper.repack(refineTemplate, [
      textChunk,
    ]);

    for (const chunk of textChunks) {
      response = await this.serviceContext.llmPredictor.predict(
        refineTemplate,
        {
          context: chunk,
          existingAnswer: response,
        },
        parentEvent
      );
    }
    return response;
  }
}

/**
 * CompactAndRefine is a slight variation of Refine that first compacts the text chunks into the smallest possible number of chunks.
 */
export class CompactAndRefine extends Refine {
  async getResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event,
    prevResponse?: string
  ): Promise<string> {
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({ ...input, query: query });
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({ ...input, query: query });

    const maxPrompt = getBiggestPrompt([textQATemplate, refineTemplate]);
    const newTexts = this.serviceContext.promptHelper.repack(
      maxPrompt,
      textChunks
    );
    const response = super.getResponse(
      query,
      newTexts,
      parentEvent,
      prevResponse
    );
    return response;
  }
}
/**
 * TreeSummarize repacks the text chunks into the smallest possible number of chunks and then summarizes them, then recursively does so until there's one chunk left.
 */
export class TreeSummarize implements BaseResponseBuilder {
  serviceContext: ServiceContext;

  constructor(serviceContext: ServiceContext) {
    this.serviceContext = serviceContext;
  }

  async getResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event
  ): Promise<string> {
    const summaryTemplate: SimplePrompt = (input) =>
      defaultTextQaPrompt({ ...input, query: query });

    if (!textChunks || textChunks.length === 0) {
      throw new Error("Must have at least one text chunk");
    }

    const packedTextChunks = this.serviceContext.promptHelper.repack(
      summaryTemplate,
      textChunks
    );

    if (packedTextChunks.length === 1) {
      return this.serviceContext.llmPredictor.predict(
        summaryTemplate,
        {
          context: packedTextChunks[0],
        },
        parentEvent
      );
    } else {
      const summaries = await Promise.all(
        packedTextChunks.map((chunk) =>
          this.serviceContext.llmPredictor.predict(
            summaryTemplate,
            {
              context: chunk,
            },
            parentEvent
          )
        )
      );

      return this.getResponse(query, summaries);
    }
  }
}

export function getResponseBuilder(
  serviceContext: ServiceContext,
  responseMode?: ResponseMode
): BaseResponseBuilder {
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

/**
 * A ResponseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export class ResponseSynthesizer {
  responseBuilder: BaseResponseBuilder;
  serviceContext: ServiceContext;

  constructor({
    responseBuilder,
    serviceContext,
  }: {
    responseBuilder?: BaseResponseBuilder;
    serviceContext?: ServiceContext;
  } = {}) {
    this.serviceContext = serviceContext ?? serviceContextFromDefaults();
    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(this.serviceContext);
  }

  async synthesize(query: string, nodes: NodeWithScore[], parentEvent?: Event) {
    let textChunks: string[] = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );
    const response = await this.responseBuilder.getResponse(
      query,
      textChunks,
      parentEvent
    );
    return new Response(
      response,
      nodes.map((node) => node.node)
    );
  }
}
