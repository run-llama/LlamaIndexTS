import { EngineResponse, type NodeWithScore } from "@llamaindex/core/schema";
import { wrapEventCaller } from "@llamaindex/core/utils";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import type { BaseRetriever } from "../../Retriever.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import { ResponseSynthesizer } from "../../synthesizers/index.js";
import type {
  QueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";
import { PromptMixin, type PromptsRecord } from '@llamaindex/core/prompts';

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine extends PromptMixin implements QueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: BaseSynthesizer;
  nodePostprocessors: BaseNodePostprocessor[];
  preFilters?: unknown;

  constructor(
    retriever: BaseRetriever,
    responseSynthesizer?: BaseSynthesizer,
    preFilters?: unknown,
    nodePostprocessors?: BaseNodePostprocessor[],
  ) {
    super();

    this.retriever = retriever;
    this.responseSynthesizer =
      responseSynthesizer ||
      new ResponseSynthesizer({
        serviceContext: retriever.serviceContext,
      });
    this.preFilters = preFilters;
    this.nodePostprocessors = nodePostprocessors || [];
  }

  protected _getPrompts() {
    return {}
  }

  protected _updatePrompts() {}

  _getPromptModules() {
    return {
      responseSynthesizer: this.responseSynthesizer,
    };
  }

  private async applyNodePostprocessors(nodes: NodeWithScore[], query: string) {
    let nodesWithScore = nodes;

    for (const postprocessor of this.nodePostprocessors) {
      nodesWithScore = await postprocessor.postprocessNodes(
        nodesWithScore,
        query,
      );
    }

    return nodesWithScore;
  }

  private async retrieve(query: string) {
    const nodes = await this.retriever.retrieve({
      query,
      preFilters: this.preFilters,
    });

    return await this.applyNodePostprocessors(nodes, query);
  }

  query(
    params: QueryEngineParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  query(params: QueryEngineParamsNonStreaming): Promise<EngineResponse>;
  @wrapEventCaller
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { query, stream } = params;
    const nodesWithScore = await this.retrieve(query);
    if (stream) {
      return this.responseSynthesizer.synthesize(
        {
          query,
          nodesWithScore,
        },
        true,
      );
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
    });
  }
}
