import {
  type MetadataFilters,
  PipelinesService,
  type RetrievalParams,
  type TextNodeWithScore,
} from "@llamaindex/cloud/api";
import { Settings } from "@llamaindex/core/global";
import type { NodeWithScore } from "@llamaindex/core/schema";
import { jsonToNode, ObjectType } from "@llamaindex/core/schema";
import { extractText, wrapEventCaller } from "@llamaindex/core/utils";
import type { BaseRetriever, RetrieveParams } from "../Retriever.js";
import type { ClientParams, CloudConstructorParams } from "./constants.js";
import { DEFAULT_PROJECT_NAME } from "./constants.js";
import { getProjectId, initService } from "./utils.js";

export type CloudRetrieveParams = Omit<
  RetrievalParams,
  "query" | "search_filters" | "dense_similarity_top_k"
> & { similarityTopK?: number; filters?: MetadataFilters };

export class LlamaCloudRetriever implements BaseRetriever {
  clientParams: ClientParams;
  retrieveParams: CloudRetrieveParams;
  organizationId?: string;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;

  private resultNodesToNodeWithScore(
    nodes: TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: TextNodeWithScore) => {
      const textNode = jsonToNode(node.node, ObjectType.TEXT);
      textNode.metadata = {
        ...textNode.metadata,
        ...node.node.extra_info, // append LlamaCloud extra_info to node metadata (file_name, pipeline_id, etc.)
      };
      return {
        // Currently LlamaCloud only supports text nodes
        node: textNode,
        score: node.score,
      };
    });
  }

  constructor(params: CloudConstructorParams & CloudRetrieveParams) {
    this.clientParams = { apiKey: params.apiKey, baseUrl: params.baseUrl };
    initService(this.clientParams);
    this.retrieveParams = params;
    this.pipelineName = params.name;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
    if (params.organizationId) {
      this.organizationId = params.organizationId;
    }
  }

  @wrapEventCaller
  async retrieve({
    query,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
    const pipelines = await PipelinesService.searchPipelinesApiV1PipelinesGet({
      projectId: await getProjectId(this.projectName, this.organizationId),
      pipelineName: this.pipelineName,
    });

    if (pipelines.length === 0 || !pipelines[0].id) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const pipeline =
      await PipelinesService.getPipelineApiV1PipelinesPipelineIdGet({
        pipelineId: pipelines[0].id,
      });

    if (!pipeline) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const results =
      await PipelinesService.runSearchApiV1PipelinesPipelineIdRetrievePost({
        pipelineId: pipeline.id,
        requestBody: {
          ...this.retrieveParams,
          query: extractText(query),
          search_filters:
            this.retrieveParams.filters ?? (preFilters as MetadataFilters),
          dense_similarity_top_k: this.retrieveParams.similarityTopK,
        },
      });

    const nodesWithScores = this.resultNodesToNodeWithScore(
      results.retrieval_nodes,
    );
    Settings.callbackManager.dispatchEvent("retrieve-end", {
      query,
      nodes: nodesWithScores,
    });
    return nodesWithScores;
  }
}
