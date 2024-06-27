import {
  type MetadataFilters,
  type RetrievalParams,
  Service,
  type TextNodeWithScore,
} from "@llamaindex/cloud/api";
import type { NodeWithScore } from "@llamaindex/core/schema";
import { jsonToNode, ObjectType } from "@llamaindex/core/schema";
import type { BaseRetriever, RetrieveParams } from "../Retriever.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { extractText } from "../llm/utils.js";
import type { ClientParams, CloudConstructorParams } from "./constants.js";
import { DEFAULT_PROJECT_NAME } from "./constants.js";
import { initService } from "./utils.js";

export type CloudRetrieveParams = Omit<
  RetrievalParams,
  "query" | "searchFilters" | "className" | "denseSimilarityTopK"
> & { similarityTopK?: number };

export class LlamaCloudRetriever implements BaseRetriever {
  clientParams: ClientParams;
  retrieveParams: CloudRetrieveParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  pipelineName: string;

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
    initService(this.clientParams);
    this.retrieveParams = params;
    this.pipelineName = params.name;
    if (params.projectName) {
      this.projectName = params.projectName;
    }
  }

  @wrapEventCaller
  async retrieve({
    query,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
    const pipelines = await Service.searchPipelinesApiV1PipelinesGet({
      projectName: this.projectName,
      pipelineName: this.pipelineName,
    });

    if (pipelines.length === 0 || !pipelines[0].id) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const pipeline = await Service.getPipelineApiV1PipelinesPipelineIdGet({
      pipelineId: pipelines[0].id,
    });

    if (!pipeline) {
      throw new Error(
        `No pipeline found with name ${this.pipelineName} in project ${this.projectName}`,
      );
    }

    const results = await Service.runSearchApiV1PipelinesPipelineIdRetrievePost(
      {
        pipelineId: pipeline.id,
        requestBody: {
          ...this.retrieveParams,
          query: extractText(query),
          search_filters: preFilters as MetadataFilters,
        },
      },
    );

    return this.resultNodesToNodeWithScore(results.retrieval_nodes);
  }
}
