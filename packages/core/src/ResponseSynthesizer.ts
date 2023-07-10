import { ChatGPTLLMPredictor, BaseLLMPredictor } from "./LLMPredictor";
import { MetadataMode, NodeWithScore } from "./Node";
import {
  SimplePrompt,
  defaultRefinePrompt,
  defaultTextQaPrompt,
} from "./Prompt";
import { getBiggestPrompt } from "./PromptHelper";
import { Response } from "./Response";
import { ServiceContext } from "./ServiceContext";
import { Event } from "./callbacks/CallbackManager";

interface BaseResponseBuilder {
  agetResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event
  ): Promise<string>;
}

export class SimpleResponseBuilder implements BaseResponseBuilder {
  llmPredictor: BaseLLMPredictor;
  textQATemplate: SimplePrompt;

  constructor(serviceContext?: ServiceContext) {
    this.llmPredictor =
      serviceContext?.llmPredictor ?? new ChatGPTLLMPredictor();
    this.textQATemplate = defaultTextQaPrompt;
  }

  async agetResponse(
    query: string,
    textChunks: string[],
    parentEvent?: Event
  ): Promise<string> {
    const input = {
      query,
      context: textChunks.join("\n\n"),
    };

    const prompt = this.textQATemplate(input);
    return this.llmPredictor.apredict(prompt, {}, parentEvent);
  }
}

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

  async agetResponse(
    query: string,
    textChunks: string[],
    prevResponse?: any
  ): Promise<string> {
    let response: string | undefined = undefined;

    for (const chunk of textChunks) {
      if (!prevResponse) {
        response = await this.giveResponseSingle(query, chunk);
      } else {
        response = await this.refineResponseSingle(prevResponse, query, chunk);
      }
      prevResponse = response;
    }

    return response ?? "Empty Response";
  }

  private async giveResponseSingle(
    queryStr: string,
    textChunk: string
  ): Promise<string> {
    const textQATemplate: SimplePrompt = (input) =>
      this.textQATemplate({ ...input, query: queryStr });
    const textChunks = this.serviceContext.promptHelper.repack(textQATemplate, [
      textChunk,
    ]);

    let response: string | undefined = undefined;

    for (const chunk of textChunks) {
      if (!response) {
        response = await this.serviceContext.llmPredictor.apredict(
          textQATemplate,
          {
            context: chunk,
          }
        );
      } else {
        response = await this.refineResponseSingle(response, queryStr, chunk);
      }
    }

    return response ?? "Empty Response";
  }

  private async refineResponseSingle(
    response: string,
    queryStr: string,
    textChunk: string
  ) {
    const refineTemplate: SimplePrompt = (input) =>
      this.refineTemplate({ ...input, query: queryStr });

    const textChunks = this.serviceContext.promptHelper.repack(refineTemplate, [
      textChunk,
    ]);

    for (const chunk of textChunks) {
      response = await this.serviceContext.llmPredictor.apredict(
        refineTemplate,
        {
          context: chunk,
          existingAnswer: response,
        }
      );
    }
    return response;
  }
}
export class CompactAndRefine extends Refine {
  async agetResponse(
    query: string,
    textChunks: string[],
    prevResponse?: any
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
    const response = super.agetResponse(query, newTexts, prevResponse);
    return response;
  }
}

export class TreeSummarize implements BaseResponseBuilder {
  serviceContext: ServiceContext;

  constructor(serviceContext: ServiceContext) {
    this.serviceContext = serviceContext;
  }

  async agetResponse(query: string, textChunks: string[]): Promise<string> {
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
      return this.serviceContext.llmPredictor.apredict(summaryTemplate, {
        context: packedTextChunks[0],
      });
    } else {
      const summaries = await Promise.all(
        packedTextChunks.map((chunk) =>
          this.serviceContext.llmPredictor.apredict(summaryTemplate, {
            context: chunk,
          })
        )
      );

      return this.agetResponse(query, summaries);
    }
  }
}

export function getResponseBuilder(
  serviceContext?: ServiceContext
): SimpleResponseBuilder {
  return new SimpleResponseBuilder(serviceContext);
}

// TODO replace with Logan's new response_sythesizers/factory.py
export class ResponseSynthesizer {
  responseBuilder: BaseResponseBuilder;
  serviceContext?: ServiceContext;

  constructor({
    responseBuilder,
    serviceContext,
  }: {
    responseBuilder?: BaseResponseBuilder;
    serviceContext?: ServiceContext;
  } = {}) {
    this.serviceContext = serviceContext;
    this.responseBuilder =
      responseBuilder ?? getResponseBuilder(this.serviceContext);
  }

  async asynthesize(
    query: string,
    nodes: NodeWithScore[],
    parentEvent?: Event
  ) {
    let textChunks: string[] = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );
    const response = await this.responseBuilder.agetResponse(
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
