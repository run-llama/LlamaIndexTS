import { randomUUID } from "@llamaindex/env";
import { Settings } from "../global";
import { PromptHelper } from "../indices";
import type { LLM, MessageContent } from "../llms";
import { PromptMixin } from "../prompts";
import { EngineResponse, type NodeWithScore } from "../schema";
import type { SynthesizeQuery } from "./type";

export type BaseSynthesizerOptions = {
  llm?: LLM;
  promptHelper?: PromptHelper;
};

export abstract class BaseSynthesizer extends PromptMixin {
  llm: LLM;
  promptHelper: PromptHelper;

  protected constructor(options: Partial<BaseSynthesizerOptions>) {
    super();
    this.llm = options.llm ?? Settings.llm;
    this.promptHelper =
      options.promptHelper ?? PromptHelper.fromLLMMetadata(this.llm.metadata);
  }

  protected abstract getResponse(
    query: MessageContent,
    textChunks: NodeWithScore[],
    stream: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>>;

  synthesize(
    query: SynthesizeQuery,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  synthesize(query: SynthesizeQuery, stream?: false): Promise<EngineResponse>;
  async synthesize(
    query: SynthesizeQuery,
    stream = false,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const callbackManager = Settings.callbackManager;
    const id = randomUUID();
    callbackManager.dispatchEvent("synthesize-start", { id, query });
    let response: EngineResponse | AsyncIterable<EngineResponse>;
    if (query.nodes.length === 0) {
      if (stream) {
        response = EngineResponse.fromResponse("Empty Response", true);
      } else {
        response = EngineResponse.fromResponse("Empty Response", false);
      }
    } else {
      const queryMessage: MessageContent =
        typeof query.query === "string" ? query.query : query.query.query;
      response = await this.getResponse(queryMessage, query.nodes, stream);
    }
    callbackManager.dispatchEvent("synthesize-end", { id, query, response });
    return response;
  }
}
