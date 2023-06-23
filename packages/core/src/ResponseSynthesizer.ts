import { ChatGPTLLMPredictor } from "./LLMPredictor";
import { NodeWithScore } from "./Node";
import { SimplePrompt, defaultTextQaPrompt } from "./Prompt";
import { Response } from "./Response";

interface BaseResponseBuilder {
  agetResponse(query: string, textChunks: string[]): Promise<string>;
}

export class SimpleResponseBuilder {
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
