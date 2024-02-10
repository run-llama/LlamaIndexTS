import { NodeWithScore } from "../../Node";
import { Response } from "../../Response";
import { BaseRetriever } from "../../Retriever";
import { ServiceContext } from "../../ServiceContext";
import { Event } from "../../callbacks/CallbackManager";
import { randomUUID } from "../../env";
import { BaseNodePostprocessor } from "../../postprocessors";
import { BaseSynthesizer, ResponseSynthesizer } from "../../synthesizers";
import {
  BaseQueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types";

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine implements BaseQueryEngine {
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
    this.retriever = retriever;
    const serviceContext: ServiceContext | undefined =
      this.retriever.getServiceContext();
    this.responseSynthesizer =
      responseSynthesizer || new ResponseSynthesizer({ serviceContext });
    this.preFilters = preFilters;
    this.nodePostprocessors = nodePostprocessors || [];
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
