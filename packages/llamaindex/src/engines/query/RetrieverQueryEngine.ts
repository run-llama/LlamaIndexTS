import type { BaseQueryEngine, QueryType } from "@llamaindex/core/query-engine";
import { EngineResponse, type NodeWithScore } from "@llamaindex/core/schema";
import { wrapEventCaller } from "@llamaindex/core/utils";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { PromptMixin } from "../../prompts/Mixin.js";
import type { BaseRetriever } from "../../Retriever.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import { ResponseSynthesizer } from "../../synthesizers/index.js";

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine
  extends PromptMixin
  implements BaseQueryEngine
{
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

  _getPromptModules() {
    return {
      responseSynthesizer: this.responseSynthesizer,
    };
  }

  private async applyNodePostprocessors(
    nodes: NodeWithScore[],
    query: QueryType,
  ) {
    let nodesWithScore = nodes;

    for (const postprocessor of this.nodePostprocessors) {
      nodesWithScore = await postprocessor.postprocessNodes(
        nodesWithScore,
        query,
      );
    }

    return nodesWithScore;
  }

  private async retrieve(query: QueryType) {
    const nodes = await this.retriever.retrieve({
      query,
      preFilters: this.preFilters,
    });

    return await this.applyNodePostprocessors(nodes, query);
  }

  query(
    queryType: QueryType,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  query(queryType: QueryType, stream?: false): Promise<EngineResponse>;
  @wrapEventCaller
  async query(
    queryType: QueryType,
    stream?: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const nodesWithScore = await this.retrieve(queryType);
    if (stream) {
      return this.responseSynthesizer.synthesize(
        {
          query: queryType,
          nodesWithScore,
        },
        true,
      );
    }
    return this.responseSynthesizer.synthesize({
      query: queryType,
      nodesWithScore,
    });
  }
}
