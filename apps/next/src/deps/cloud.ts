import {
  type MetadataFilter,
  type MetadataFilters,
  PipelinesService,
  type RetrievalParams,
  type TextNodeWithScore,
} from "@llamaindex/cloud/api";
import { QueryBundle } from "@llamaindex/core/query-engine";
import { BaseRetriever } from "@llamaindex/core/retriever";
import { jsonToNode, NodeWithScore, ObjectType } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";

export type CloudRetrieveParams = Omit<
  RetrievalParams,
  "query" | "search_filters" | "dense_similarity_top_k"
> & { similarityTopK?: number; filters?: MetadataFilters };

export type LlamaCloudRetrieverParams = {
  apiKey: string;
  baseUrl: string;
  pipelineId: string;
} & CloudRetrieveParams;

export class LlamaCloudRetriever extends BaseRetriever {
  baseUrl: string;
  apiKey: string;

  retrieveParams: CloudRetrieveParams;
  organizationId?: string;
  pipelineId: string;

  private resultNodesToNodeWithScore(
    nodes: TextNodeWithScore[],
  ): NodeWithScore[] {
    return nodes.map((node: TextNodeWithScore) => {
      const textNode = jsonToNode(node.node, ObjectType.TEXT);
      textNode.metadata = {
        ...textNode.metadata,
        ...node.node.extra_info,
      };
      return {
        node: textNode,
        score: node.score ?? undefined,
      };
    });
  }

  private convertFilter(filters?: MetadataFilters): MetadataFilters | null {
    if (!filters) return null;

    const processFilter = (
      filter: MetadataFilter | MetadataFilters,
    ): MetadataFilter | MetadataFilters => {
      if ("filters" in filter) {
        // type MetadataFilters
        return { ...filter, filters: filter.filters.map(processFilter) };
      }
      return { ...filter, value: filter.value ?? null };
    };

    return { ...filters, filters: filters.filters.map(processFilter) };
  }

  constructor(params: LlamaCloudRetrieverParams) {
    super();
    this.baseUrl = params.baseUrl;
    this.apiKey = params.apiKey;
    this.retrieveParams = params;
    this.pipelineId = params.pipelineId;
  }

  override async _retrieve(query: QueryBundle): Promise<NodeWithScore[]> {
    const filters = this.convertFilter(this.retrieveParams.filters);
    const pipelineId = this.pipelineId;

    const { data: results } =
      await PipelinesService.runSearchApiV1PipelinesPipelineIdRetrievePost({
        throwOnError: true,
        path: {
          pipeline_id: pipelineId,
        },
        baseUrl: this.baseUrl,
        body: {
          ...this.retrieveParams,
          query: extractText(query),
          search_filters: filters,
          dense_similarity_top_k: this.retrieveParams.similarityTopK!,
        },
        headers: {
          authorization: `Bearer ${this.apiKey}`,
        },
      });

    return this.resultNodesToNodeWithScore(results.retrieval_nodes);
  }
}
