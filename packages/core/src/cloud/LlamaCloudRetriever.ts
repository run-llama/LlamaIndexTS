import type { PlatformApi, PlatformApiClient } from "@llamaindex/cloud";
import type { NodeWithScore } from "../Node.js";
import { ObjectType, jsonToNode } from "../Node.js";
import type { BaseRetriever, RetrieveParams } from "../Retriever.js";
import { Settings } from "../Settings.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
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
  }

  private async getClient(): Promise<PlatformApiClient> {
    if (!this.client) {
      this.client = await getClient(this.clientParams);
    }
    return this.client;
  }

  @wrapEventCaller
  async retrieve({
    query,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
    const pipelines = await (
      await this.getClient()
    ).pipeline.searchPipelines({
      projectName: this.projectName,
      pipelineName: this.pipelineName,
    });
    if (pipelines.length !== 1 && !pipelines[0]?.id) {
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

    Settings.callbackManager.dispatchEvent("retrieve", {
      query,
      nodes,
    });

    return nodes;
  }
}
