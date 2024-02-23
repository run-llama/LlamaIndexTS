import {
  AddParams,
  ChromaClient,
  ChromaClientParams,
  Collection,
  IncludeEnum,
  QueryResponse,
  Where,
  WhereDocument,
} from "chromadb";
import { BaseNode, MetadataMode } from "../../Node.js";
import {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

type ChromaDeleteOptions = {
  where?: Where;
  whereDocument?: WhereDocument;
};

type ChromaQueryOptions = {
  whereDocument?: WhereDocument;
};

const DEFAULT_TEXT_KEY = "text";

export class ChromaVectorStore implements VectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;
  textKey: string;
  private chromaClient: ChromaClient;
  private collection: Collection | null = null;
  private collectionName: string;

  constructor(init: {
    collectionName: string;
    textKey?: string;
    chromaClientParams?: ChromaClientParams;
  }) {
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

  private getDataToInsert(nodes: BaseNode[]): AddParams {
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
    await collection.delete({
      ids: [refDocId],
      where: deleteOptions?.where,
      whereDocument: deleteOptions?.whereDocument,
    });
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

    const chromaWhere: { [x: string]: string | number | boolean } = {};
    if (query.filters?.filters) {
      query.filters.filters.map((filter) => {
        const filterKey = filter.key;
        const filterValue = filter.value;
        chromaWhere[filterKey] = filterValue;
      });
    }

    const collection = await this.getCollection();
    const queryResponse: QueryResponse = await collection.query({
      queryEmbeddings: query.queryEmbedding ?? undefined,
      queryTexts: query.queryStr ?? undefined,
      nResults: query.similarityTopK,
      where: Object.keys(chromaWhere).length ? chromaWhere : undefined,
      whereDocument: options?.whereDocument,
      //ChromaDB doesn't return the result embeddings by default so we need to include them
      include: [
        IncludeEnum.Distances,
        IncludeEnum.Metadatas,
        IncludeEnum.Documents,
        IncludeEnum.Embeddings,
      ],
    });
    const vectorStoreQueryResult: VectorStoreQueryResult = {
      nodes: queryResponse.ids[0].map((id, index) => {
        const text = (queryResponse.documents as string[][])[0][index];
        const metaData = queryResponse.metadatas[0][index] ?? {};
        const node = metadataDictToNode(metaData);
        node.setContent(text);
        return node;
      }),
      similarities: (queryResponse.distances as number[][])[0].map(
        (distance) => 1 - distance,
      ),
      ids: queryResponse.ids[0],
    };
    return vectorStoreQueryResult;
  }
}
