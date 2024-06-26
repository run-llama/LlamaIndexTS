import type { LlamaCloudApi, LlamaCloudApiClient } from "@llamaindex/cloud";
import type { NodeWithScore } from "@llamaindex/core/schema";
import { ObjectType, jsonToNode } from "@llamaindex/core/schema";
import type { BaseRetriever, RetrieveParams } from "../Retriever.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { extractText } from "../llm/utils.js";
import type { ClientParams, CloudConstructorParams } from "./types.js";
import { DEFAULT_PROJECT_NAME } from "./types.js";
import { getClient } from "./utils.js";

export type CloudRetrieveParams = Omit<
  LlamaCloudApi.RetrievalParams,
  "query" | "searchFilters" | "className" | "denseSimilarityTopK"
> & { similarityTopK?: number };

export class LlamaCloudRetriever implements BaseRetriever {
  client?: LlamaCloudApiClient;
  clientParams: ClientParams;
  retrieveParams: CloudRetrieveParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;

  private resultNodesToNodeWithScore(
    nodes: LlamaCloudApi.TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: LlamaCloudApi.TextNodeWithScore) => {
      return {
        // Currently LlamaCloud only supports text nodes
        node: jsonToNode(node.node, ObjectType.TEXT),
        score: node.score,
      };
    });
  }

  constructor(params: CloudConstructorParams & CloudRetrieveParams) {
    this.clientParams = { apiKey: params.apiKey, baseUrl: params.baseUrl };
    this.retrieveParams = params;
    this.pipelineName = params.name;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
  }

  private async getClient(): Promise<LlamaCloudApiClient> {
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
    const client = await this.getClient();

    const pipelines = await client?.pipelines.searchPipelines({
      projectName: this.projectName,
      pipelineName: this.pipelineName,
    });

    if (!pipelines) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const pipeline = await client?.pipelines.getPipeline(pipelines[0].id);

    if (!pipeline) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const results = await client?.pipelines.runSearch(pipeline.id, {
      ...this.retrieveParams,
      query: extractText(query),
      searchFilters: preFilters as LlamaCloudApi.MetadataFilters,
    });

    const nodes = this.resultNodesToNodeWithScore(results.retrievalNodes);

    getCallbackManager().dispatchEvent("retrieve", {
      query,
      nodes,
    });

    return nodes;
  }
}
