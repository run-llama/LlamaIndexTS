import type { NodeWithScore } from "../../Node.js";
import type { Response } from "../../Response.js";
import type { BaseRetriever } from "../../Retriever.js";
import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import { toQueryBundle } from "../../internal/utils.js";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { PromptMixin } from "../../prompts/Mixin.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import { ResponseSynthesizer } from "../../synthesizers/index.js";
import type {
  BaseQueryEngine,
  MessageContent,
  QueryBundle,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine<Filters = unknown>
  extends PromptMixin
  implements BaseQueryEngine
{
  constructor(
    public retriever: BaseRetriever<Filters>,
    public responseSynthesizer: BaseSynthesizer = new ResponseSynthesizer({
      serviceContext: retriever.serviceContext,
    }),
    public preFilters?: Filters,
    public nodePostprocessors: BaseNodePostprocessor[] = [],
  ) {
    super();
  }

  _getPromptModules() {
    return {
      responseSynthesizer: this.responseSynthesizer,
    };
  }

  private async applyNodePostprocessors(
    nodes: NodeWithScore[],
    query: QueryBundle | MessageContent,
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

  private async retrieve(query: QueryBundle) {
    const nodes = await this.retriever.retrieve({
      ...query,
      preFilters: this.preFilters,
    });

    return await this.applyNodePostprocessors(nodes, query);
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  @wrapEventCaller
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;
    const nodesWithScore = await this.retrieve(toQueryBundle(query));
    if (stream) {
      return this.responseSynthesizer.synthesize({
        query,
        nodesWithScore,
        stream: true,
      });
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
    });
  }
}
