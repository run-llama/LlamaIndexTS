import {
  AddParams,
  ChromaClient,
  Collection,
  Embeddings,
  IncludeEnum,
  Where,
  WhereDocument,
} from "chromadb";
import { BaseNode, Document, MetadataMode } from "../../Node";
import {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
} from "./types";

type ChromaDBParams = {
  collectionName: string;
};

type ChromaDeleteOptions = {
  where?: Where;
  whereDocument?: WhereDocument;
};

type ChromaQueryOptions = {
  whereDocument?: WhereDocument;
};

export class ChromaVectorStore implements VectorStore {
  storesText: boolean = true;
  private chromaClient: ChromaClient;
  private collection: Collection | null = null;

  constructor() {
    this.clearCollection();
    this.chromaClient = new ChromaClient();
  }

  client(): ChromaClient {
    return this.chromaClient;
  }

  async setCollection(collectionName: string) {
    const coll = await this.chromaClient.createCollection({
      name: collectionName,
    });
    this.collection = coll;
  }

  getCollection(): Collection {
    if (!this.collection) {
      throw new Error("Must initialize collection before getting.");
    }
    return this.collection;
  }

  clearCollection(): void {
    this.collection = null;
  }

  private getDataToInsert(nodes: BaseNode[]): AddParams {
    return {
      embeddings: nodes.map((node) => node.getEmbedding()),
      ids: nodes.map((node) => node.id_),
      metadatas: nodes.map((node) => node.metadata),
      documents: nodes.map((node) => node.getContent(MetadataMode.NONE)),
    };
  }

  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!nodes || nodes.length === 0) {
      return [];
    }

    const dataToInsert = this.getDataToInsert(nodes);

    try {
      await this.getCollection().add(dataToInsert);
    } catch (err) {
      const msg = `${err}`;
      console.log(msg, err);
      return [];
    }

    return nodes.map((node) => node.id_);
  }

  async delete(
    refDocId: string,
    deleteOptions?: ChromaDeleteOptions,
  ): Promise<void> {
    try {
      await this.getCollection().delete({
        ids: [refDocId],
        where: deleteOptions?.where,
        whereDocument: deleteOptions?.whereDocument,
      });
      this.clearCollection();
    } catch (err) {
      const msg = `${err}`;
      console.log(msg, err);
      throw err;
    }
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
    if (query.filters) {
      query.filters.filters.map((filter) => {
        const filterKey = filter.key;
        const filterValue = filter.value;
        chromaWhere[filterKey] = filterValue;
      });
    }
    try {
      const queryResponse = await this.getCollection().query({
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
      //Only given 1 embedding/text, so get 0th index for everything
      const vectorStoreQueryResult: VectorStoreQueryResult = {
        nodes: queryResponse.ids[0].map((id, index) => {
          return new Document({
            id_: id,
            text: (queryResponse.documents as string[][])[0][index],
            metadata: queryResponse.metadatas[0][index] ?? {},
            embedding: (queryResponse.embeddings as Embeddings[])[0][index],
          });
        }),
        similarities: (queryResponse.distances as number[][])[0].map(
          (distance) => 1 - distance,
        ),
        ids: queryResponse.ids[0],
      };
      return vectorStoreQueryResult;
    } catch (err) {
      const msg = `${err}`;
      console.log(msg, err);
      throw err;
    }
  }
}
