import {
  type MetadataFilters,
  PipelinesService,
  type RetrievalParams,
  type TextNodeWithScore,
} from "@llamaindex/cloud/api";
import { DEFAULT_PROJECT_NAME } from "@llamaindex/core/global";
import type { QueryBundle } from "@llamaindex/core/query-engine";
import { BaseRetriever } from "@llamaindex/core/retriever";
import type { NodeWithScore } from "@llamaindex/core/schema";
import { jsonToNode, ObjectType } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import type { ClientParams, CloudConstructorParams } from "./type.js";
import { getProjectId, initService } from "./utils.js";

export type CloudRetrieveParams = Omit<
  RetrievalParams,
  "query" | "search_filters" | "dense_similarity_top_k"
> & { similarityTopK?: number; filters?: MetadataFilters };

export class LlamaCloudRetriever extends BaseRetriever {
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
    super();
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

  async _retrieve(query: QueryBundle): Promise<NodeWithScore[]> {
    const { data: pipelines } =
      await PipelinesService.searchPipelinesApiV1PipelinesGet({
        query: {
          project_id: await getProjectId(this.projectName, this.organizationId),
          project_name: this.pipelineName,
        },
        throwOnError: true,
      });

    if (pipelines.length === 0 || !pipelines[0]!.id) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const { data: pipeline } =
      await PipelinesService.getPipelineApiV1PipelinesPipelineIdGet({
        path: {
          pipeline_id: pipelines[0]!.id,
        },
        throwOnError: true,
      });

    if (!pipeline) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const { data: results } =
      await PipelinesService.runSearchApiV1PipelinesPipelineIdRetrievePost({
        throwOnError: true,
        path: {
          pipeline_id: pipeline.id,
        },
        body: {
          ...this.retrieveParams,
          query: extractText(query),
          search_filters: this.retrieveParams.filters as MetadataFilters,
          dense_similarity_top_k: this.retrieveParams.similarityTopK!,
        },
      });

    return this.resultNodesToNodeWithScore(results.retrieval_nodes);
  }
}
