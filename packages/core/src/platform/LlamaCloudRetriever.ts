import { NodeWithScore, jsonToNode } from "../Node";
import { BaseRetriever } from "../Retriever";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { Event } from "../callbacks/CallbackManager";
import { PlatformApiClient } from "./client";
import { RetrievalParams, TextNodeWithScore } from "./client/api";
import { CloudConstructorParams, DEFAULT_PROJECT_NAME } from "./types";
import { getClient } from "./utils";

export type RetrieveParams = Omit<
  RetrievalParams,
  "query" | "searchFilters" | "pipelineId" | "className"
>;

export class LlamaCloudRetriever implements BaseRetriever {
  client: PlatformApiClient;
  retrieveParams: RetrieveParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;
  serviceContext: ServiceContext;

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

  constructor(params: CloudConstructorParams & RetrieveParams) {
    const { apiKey, baseUrl } = params;
    this.client = getClient({ apiKey, baseUrl });
    this.retrieveParams = params;
    this.pipelineName = params.name;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
    this.serviceContext = params.serviceContext ?? serviceContextFromDefaults();
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
      ...this.retrieveParams,
      pipelineId: pipelines[0].id,
      query,
      searchFilters: preFilters as Record<string, unknown[]>,
    });

    return this.resultNodesToNodeWithScore(results.retrievalNodes);
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }
}
