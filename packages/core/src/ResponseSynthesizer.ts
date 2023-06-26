import { ChatGPTLLMPredictor } from "./LLMPredictor";
import { NodeWithScore } from "./Node";
import { SimplePrompt, defaultTextQaPrompt } from "./Prompt";
import { Response } from "./Response";
import { ServiceContext } from "./ServiceContext";

interface BaseResponseBuilder {
  agetResponse(query: string, textChunks: string[]): Promise<string>;
}

export class SimpleResponseBuilder implements BaseResponseBuilder {
  llmPredictor: ChatGPTLLMPredictor;
  textQATemplate: SimplePrompt;

  constructor() {
    this.llmPredictor = new ChatGPTLLMPredictor();
    this.textQATemplate = defaultTextQaPrompt;
  }

  async agetResponse(query: string, textChunks: string[]): Promise<string> {
    const input = {
      query,
      context: textChunks.join("\n\n"),
    };

    const prompt = this.textQATemplate(input);
    return this.llmPredictor.apredict(prompt, {});
  }
}

export class Refine implements BaseResponseBuilder {
  async agetResponse(
    query: string,
    textChunks: string[],
    prevResponse?: any
  ): Promise<string> {
    throw new Error("Not implemented yet");
  }

  private giveResponseSingle(queryStr: string, textChunk: string) {
    const textQATemplate = defaultTextQaPrompt;
  }

  private refineResponseSingle(
    response: string,
    queryStr: string,
    textChunk: string
  ) {
    throw new Error("Not implemented yet");
  }
}
export class CompactAndRefine extends Refine {
  async agetResponse(
    query: string,
    textChunks: string[],
    prevResponse?: any
  ): Promise<string> {
    throw new Error("Not implemented yet");
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

    // TODO repack more intelligently
    // Combine text chunks in pairs into packedTextChunks
    let packedTextChunks: string[] = [];
    for (let i = 0; i < textChunks.length; i += 2) {
      if (i + 1 < textChunks.length) {
        packedTextChunks.push(textChunks[i] + "\n\n" + textChunks[i + 1]);
      } else {
        packedTextChunks.push(textChunks[i]);
      }
    }

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

export function getResponseBuilder(): BaseResponseBuilder {
  return new SimpleResponseBuilder();
}

export class ResponseSynthesizer {
  responseBuilder: BaseResponseBuilder;

  constructor() {
    this.responseBuilder = getResponseBuilder();
  }

  async asynthesize(query: string, nodes: NodeWithScore[]) {
    let textChunks: string[] = nodes.map((node) => node.node.text);
    const response = await this.responseBuilder.agetResponse(query, textChunks);
    return new Response(
      response,
      nodes.map((node) => node.node)
    );
  }
}
