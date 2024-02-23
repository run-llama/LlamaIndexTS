import { PlatformApi, PlatformApiClient } from "@llamaindex/cloud";
import { globalsHelper } from "../GlobalsHelper";
import { NodeWithScore, ObjectType, jsonToNode } from "../Node";
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
> & { similarityTopK?: number };

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
        // Currently LlamaCloud only supports text nodes
        node: jsonToNode(node.node, ObjectType.TEXT),
        score: node.score,
      };
    });
  }

  constructor(params: CloudConstructorParams & RetrieveParams) {
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

  async retrieve(
    query: string,
    parentEvent?: Event | undefined,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
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
