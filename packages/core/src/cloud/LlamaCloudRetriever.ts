import { PlatformApi, PlatformApiClient } from "@llamaindex/cloud";
import { NodeWithScore, jsonToNode } from "../Node";
import { BaseRetriever } from "../Retriever";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import { Event } from "../callbacks/CallbackManager";
import {
  ClientParams,
  CloudConstructorParams,
  DEFAULT_PROJECT_NAME,
} from "./types";
import { getClient } from "./utils";

export type RetrieveParams = Omit<
  PlatformApi.RetrievalParams,
  "query" | "searchFilters" | "pipelineId" | "className"
>;

export class LlamaCloudRetriever implements BaseRetriever {
  client?: PlatformApiClient;
  clientParams: ClientParams;
  retrieveParams: RetrieveParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;
  serviceContext: ServiceContext;

  private resultNodesToNodeWithScore(
    nodes: PlatformApi.TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: PlatformApi.TextNodeWithScore) => {
      return {
        node: jsonToNode(node.node),
        score: node.score,
      };
    });
  }

  constructor(params: CloudConstructorParams & RetrieveParams) {
    this.clientParams = { apiKey: params.apiKey, baseUrl: params.baseUrl };
    this.retrieveParams = params;
    this.pipelineName = params.name;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
    this.serviceContext = params.serviceContext ?? serviceContextFromDefaults();
  }

  private async getClient(): Promise<PlatformApiClient> {
    if (!this.client) {
      this.client = await getClient(this.clientParams);
    }
    return this.client;
  }

  async retrieve(
    query: string,
    parentEvent?: Event | undefined,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
    // TODO: add event
    const pipelines = await (
      await this.getClient()
    ).pipeline.searchPipelines({
      projectName: this.projectName,
      pipelineName: this.pipelineName,
    });
    if (pipelines.length !== 1 && !pipelines[0].id) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }
    const results = await (
      await this.getClient()
    ).pipeline.runSearch(pipelines[0].id, {
      ...this.retrieveParams,
      query,
      searchFilters: preFilters as Record<string, unknown[]>,
    });

    return this.resultNodesToNodeWithScore(results.retrievalNodes);
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }
}
