import type { RetrievalParams, TextNodeWithScore } from "@llamaindex/cloud";
import * as PlatformApiTypes from "@llamaindex/cloud";
import type { NodeWithScore } from "../Node.js";
import { ObjectType, jsonToNode } from "../Node.js";
import type { BaseRetriever, RetrieveParams } from "../Retriever.js";
import { Settings } from "../Settings.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import type {
  ClientParams,
  CloudConstructorParams,
  ObjectToCamel,
} from "./types.js";
import { DEFAULT_PROJECT_NAME } from "./types.js";
import { getClient, paramsToSnakeCase } from "./utils.js";

export type CloudRetrieveParams = Omit<
  ObjectToCamel<RetrievalParams>,
  "query" | "searchFilters" | "className" | "denseSimilarityTopK"
> & { similarityTopK?: number };

type PlatformApi = typeof PlatformApiTypes;
export class LlamaCloudRetriever implements BaseRetriever {
  client?: PlatformApi;
  clientParams: ClientParams;
  retrieveParams: CloudRetrieveParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;
  pipelineId: string;

  private resultNodesToNodeWithScore(
    nodes: TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: TextNodeWithScore) => {
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
    if (!params.pipelineId) {
      throw new Error("pipelineId is required for LlamaCloudRetriever");
    }
    this.pipelineId = params.pipelineId;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
  }

  private getClient(): PlatformApi {
    if (!this.client) {
      this.client = getClient(this.clientParams);
    }
    return this.client;
  }

  @wrapEventCaller
  async retrieve({
    query,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
    const pipeline =
      await this.getClient().getPipelineApiV1PipelinesPipelineIdGet({
        pipelineId: this.pipelineId,
      });

    if (!pipeline) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const search_params: RetrievalParams = {
      query,
      search_filters: preFilters,
      ...this.retrieveParams,
    };

    if (this.retrieveParams.similarityTopK) {
      search_params.dense_similarity_top_k = this.retrieveParams.similarityTopK;
    }

    const results =
      await this.getClient().runSearchApiV1PipelinesPipelineIdRetrievePost({
        pipelineId: pipeline.id,
        requestBody: {
          query,
          search_filters: preFilters,
          ...paramsToSnakeCase(this.retrieveParams),
        },
      });

    const nodes = this.resultNodesToNodeWithScore(results.retrieval_nodes);

    Settings.callbackManager.dispatchEvent("retrieve", {
      query,
      nodes,
    });

    return nodes;
  }
}
