import { randomUUID } from "@llamaindex/env";
import type { NodeWithScore } from "../../Node.js";
import type { Response } from "../../Response.js";
import type { BaseRetriever } from "../../Retriever.js";
import type { ServiceContext } from "../../ServiceContext.js";
import type { Event } from "../../callbacks/CallbackManager.js";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { PromptMixin } from "../../prompts/Mixin.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import { ResponseSynthesizer } from "../../synthesizers/index.js";
import type {
  BaseQueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";

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
    const serviceContext: ServiceContext | undefined =
      this.retriever.getServiceContext();
    this.responseSynthesizer =
      responseSynthesizer || new ResponseSynthesizer({ serviceContext });
    this.preFilters = preFilters;
    this.nodePostprocessors = nodePostprocessors || [];
  }

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

  private async retrieve(query: string, parentEvent: Event) {
    const nodes = await this.retriever.retrieve(
      query,
      parentEvent,
      this.preFilters,
    );

    return await this.applyNodePostprocessors(nodes, query);
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;
    const parentEvent: Event = params.parentEvent || {
      id: randomUUID(),
      type: "wrapper",
      tags: ["final"],
    };
    const nodesWithScore = await this.retrieve(query, parentEvent);
    if (stream) {
      return this.responseSynthesizer.synthesize({
        query,
        nodesWithScore,
        parentEvent,
        stream: true,
      });
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
      parentEvent,
    });
  }
}
