import type { BaseNode } from "@llamaindex/core/schema";
import { MetadataMode } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  metadataDictToNode,
  nodeToMetadata,
  VectorStoreQueryMode,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";
import {
  ChromaClient,
  type ChromaClientParams,
  type DeleteParams,
  type QueryRecordsParams,
  type QueryResponse,
  type Where,
  type WhereDocument,
} from "chromadb";

type ChromaDeleteOptions = {
  where?: Where;
  whereDocument?: WhereDocument;
};

type ChromaQueryOptions = {
  whereDocument?: WhereDocument;
};

type Collection = Awaited<ReturnType<ChromaClient["getOrCreateCollection"]>>;

const DEFAULT_TEXT_KEY = "text";

type ChromaFilterCondition = "$and" | "$or";
type ChromaFilterOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$lt"
  | "$gte"
  | "$lte"
  | "$in"
  | "$nin";

export class ChromaVectorStore extends BaseVectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;
  textKey: string;
  private chromaClient: ChromaClient;
  private collection: Collection | null = null;
  private collectionName: string;

  constructor(
    init: {
      collectionName: string;
      textKey?: string;
      chromaClientParams?: ChromaClientParams;
    } & VectorStoreBaseParams,
  ) {
    super(init);
    this.collectionName = init.collectionName;
    this.chromaClient = new ChromaClient(init.chromaClientParams);
    this.textKey = init.textKey ?? DEFAULT_TEXT_KEY;
  }

  client(): ChromaClient {
    return this.chromaClient;
  }

  async getCollection(): Promise<Collection> {
    if (!this.collection) {
      const coll = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
      });
      this.collection = coll;
    }
    return this.collection;
  }

  private getDataToInsert(nodes: BaseNode[]) {
    const metadatas = nodes.map((node) =>
      nodeToMetadata(node, true, this.textKey, this.flatMetadata),
    );
    return {
      embeddings: nodes.map((node) => node.getEmbedding()),
      ids: nodes.map((node) => node.id_),
      metadatas,
      documents: nodes.map((node) => node.getContent(MetadataMode.NONE)),
    };
  }

  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!nodes || nodes.length === 0) {
      return [];
    }

    const dataToInsert = this.getDataToInsert(nodes);
    const collection = await this.getCollection();
    await collection.add(dataToInsert);
    return nodes.map((node) => node.id_);
  }

  async delete(
    refDocId: string,
    deleteOptions?: ChromaDeleteOptions,
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.delete(<DeleteParams>{
      ids: [refDocId],
      where: deleteOptions?.where,
      whereDocument: deleteOptions?.whereDocument,
    });
  }

  private transformChromaFilterCondition(
    condition: FilterCondition,
  ): ChromaFilterCondition {
    switch (condition) {
      case FilterCondition.AND:
        return "$and";
      case FilterCondition.OR:
        return "$or";
      default:
        throw new Error(`Filter condition ${condition} not supported`);
    }
  }

  private transformChromaFilterOperator(
    operator: FilterOperator,
  ): ChromaFilterOperator {
    switch (operator) {
      case FilterOperator.EQ:
        return "$eq";
      case FilterOperator.NE:
        return "$ne";
      case FilterOperator.GT:
        return "$gt";
      case FilterOperator.LT:
        return "$lt";
      case FilterOperator.GTE:
        return "$gte";
      case FilterOperator.LTE:
        return "$lte";
      case FilterOperator.IN:
        return "$in";
      case FilterOperator.NIN:
        return "$nin";
      default:
        throw new Error(`Filter operator ${operator} not supported`);
    }
  }

  private toChromaFilter(filters: MetadataFilters): Where {
    const chromaFilter: Where = {};
    const filtersList: Where[] = [];

    const condition = filters.condition
      ? this.transformChromaFilterCondition(
          filters.condition as FilterCondition,
        )
      : "$and";

    if (filters.filters) {
      for (const filter of filters.filters) {
        if (filter.operator) {
          filtersList.push({
            [filter.key]: {
              [this.transformChromaFilterOperator(
                filter.operator as FilterOperator,
              )]: filter.value,
            },
          });
        } else {
          filtersList.push({ [filter.key]: filter.value });
        }
      }

      if (filtersList.length === 1) {
        return filtersList[0]!;
      } else if (filtersList.length > 1) {
        chromaFilter[condition] = filtersList;
      }
    }

    return chromaFilter;
  }

  async query(
    query: VectorStoreQuery,
    options?: ChromaQueryOptions,
  ): Promise<VectorStoreQueryResult> {
    if (query.docIds) {
      throw new Error("ChromaDB does not support querying by docIDs");
    }
    if (query.mode != VectorStoreQueryMode.DEFAULT) {
      throw new Error("ChromaDB does not support querying by mode");
    }

    let chromaWhere: Where = {};
    if (query.filters) {
      chromaWhere = this.toChromaFilter(query.filters);
    }

    const collection = await this.getCollection();
    const queryResponse: QueryResponse = await collection.query(<
      QueryRecordsParams
    >{
      queryEmbeddings: query.queryEmbedding ?? undefined,
      queryTexts: query.queryStr ?? undefined,
      nResults: query.similarityTopK,
      where: Object.keys(chromaWhere).length ? chromaWhere : undefined,
      whereDocument: options?.whereDocument,
      //ChromaDB doesn't return the result embeddings by default so we need to include them
      include: ["distances", "metadatas", "documents", "embeddings"],
    });

    const vectorStoreQueryResult: VectorStoreQueryResult = {
      nodes: queryResponse.ids[0]!.map((id, index) => {
        const text = (queryResponse.documents as string[][])[0]![index];
        const metaData = queryResponse.metadatas[0]![index] ?? {};
        const node = metadataDictToNode(metaData);
        node.setContent(text);
        return node;
      }),
      similarities: (queryResponse.distances as number[][])[0]!.map(
        (distance) => 1 - distance,
      ),
      ids: queryResponse.ids[0]!,
    };
    return vectorStoreQueryResult;
  }
}
