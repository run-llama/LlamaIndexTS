import { NodeWithScore, jsonToNode } from "../Node";
import { BaseRetriever } from "../Retriever";
import { ServiceContext } from "../ServiceContext";
import { Event } from "../callbacks/CallbackManager";
import { PlatformApiClient } from "./client";
import { RetrievalParams, TextNodeWithScore } from "./client/api";
import { ClientParams, DEFAULT_PROJECT_NAME, getClient } from "./utils";

type SearchParams = Omit<
  RetrievalParams,
  "query" | "searchFilters" | "pipelineId" | "className"
>;
type RetrieverParams = { name: string; projectName?: string } & ClientParams &
  SearchParams;

export class LlamaCloudRetriever implements BaseRetriever {
  client: PlatformApiClient;
  searchParams: SearchParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;

  private resultNodesToNodeWithScore(
    nodes: TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: TextNodeWithScore) => {
      return {
        node: jsonToNode(node.node),
        score: node.score,
      };
    });
  }

  constructor(params: RetrieverParams) {
    const { apiKey, baseUrl } = params;
    this.client = getClient({ apiKey, baseUrl });
    this.searchParams = params;
    this.pipelineName = params.name;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
  }

  async retrieve(
    query: string,
    parentEvent?: Event | undefined,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
    // TODO: add event
    const pipelines = await this.client.pipeline.searchPipelines({
      projectName: this.projectName,
      pipelineName: this.pipelineName,
    });
    if (pipelines.length !== 1 && !pipelines[0].id) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }
    const results = await this.client.retrieval.runSearch({
      ...this.searchParams,
      pipelineId: pipelines[0].id,
      query,
      searchFilters: preFilters as Record<string, unknown[]>,
    });

    return this.resultNodesToNodeWithScore(results.retrievalNodes);
  }

  getServiceContext(): ServiceContext {
    throw new Error("Method not implemented.");
  }
}
