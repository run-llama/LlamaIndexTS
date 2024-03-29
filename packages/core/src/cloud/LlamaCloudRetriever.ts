import type { PlatformApi, PlatformApiClient } from "@llamaindex/cloud";
import { globalsHelper } from "../GlobalsHelper.js";
import type { NodeWithScore } from "../Node.js";
import { ObjectType, jsonToNode } from "../Node.js";
import type { BaseRetriever, RetrieveParams } from "../Retriever.js";
import type { ServiceContext } from "../ServiceContext.js";
import { serviceContextFromDefaults } from "../ServiceContext.js";
import type { ClientParams, CloudConstructorParams } from "./types.js";
import { DEFAULT_PROJECT_NAME } from "./types.js";
import { getClient } from "./utils.js";

export type CloudRetrieveParams = Omit<
  PlatformApi.RetrievalParams,
  "query" | "searchFilters" | "pipelineId" | "className"
> & { similarityTopK?: number };

export class LlamaCloudRetriever implements BaseRetriever {
  client?: PlatformApiClient;
  clientParams: ClientParams;
  retrieveParams: CloudRetrieveParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;
  serviceContext: ServiceContext;

  private resultNodesToNodeWithScore(
    nodes: PlatformApi.TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: PlatformApi.TextNodeWithScore) => {
      return {
        // Currently LlamaCloud only supports text nodes
        node: jsonToNode(node.node, ObjectType.TEXT),
        score: node.score,
      };
    });
  }

  constructor(params: CloudConstructorParams & CloudRetrieveParams) {
    this.clientParams = { apiKey: params.apiKey, baseUrl: params.baseUrl };
    if (params.similarityTopK) {
      params.denseSimilarityTopK = params.similarityTopK;
    }
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

  async retrieve({
    query,
    parentEvent,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
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

    const nodes = this.resultNodesToNodeWithScore(results.retrievalNodes);

    if (this.serviceContext.callbackManager.onRetrieve) {
      this.serviceContext.callbackManager.onRetrieve({
        query,
        nodes,
        event: globalsHelper.createEvent({
          parentEvent,
          type: "retrieve",
        }),
      });
    }
    return nodes;
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }
}
