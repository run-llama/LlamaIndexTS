import { VectorStore, VectorStoreQuery, VectorStoreQueryMode, VectorStoreQueryResult } from "./types";
import { BaseNode, Document, MetadataMode } from "../../Node";
import { ChromaClient, Collection, IncludeEnum, Where, WhereDocument, Metadata, Embeddings } from 'chromadb'

type ChromaDBParams = {
  collectionName: string
}

type ChromaDeleteOptions = {
  where?: Where;
  whereDocument?: WhereDocument;
}

type ChromaQueryOptions = {
  whereDocument?: WhereDocument
}

export class ChromaVectorStore implements VectorStore {
  storesText: boolean = true;
  private chromaClient: ChromaClient
  private collection: Collection | null;

  constructor(params: ChromaDBParams) {
    this.chromaClient = new ChromaClient();
    this.collection = null;
    //create the collection
    this.chromaClient.createCollection({
      name: params.collectionName,
    }).then((collection) => {
      this.collection = collection;
    }).catch((err) => {
      console.error(err);
    }
    );
  }

  client(): ChromaClient {
    return this.chromaClient;
  }

  //Add document to ChromaDB collection
  async add(embeddingResults: BaseNode[]): Promise<string[]> {
    if (!this.collection) {
        throw new Error("Must initialize collection before adding.");
    }

    const allNodesHaveEmbeddings = embeddingResults.every((node) => node.embedding != undefined);
    const embeddings = allNodesHaveEmbeddings ? embeddingResults.map((node) => node.getEmbedding()): undefined
    try {
      await this.collection.add({
        ids: embeddingResults.map((node) => node.id_),
        metadatas: embeddingResults.map((node) => node.metadata),
        documents: embeddingResults.map((node) => node.getContent(MetadataMode.NONE)),
        embeddings: embeddings
      });
    }
    catch (err) {
      const msg = `${err}`
      console.log(msg, err);
      throw err
    }
    return embeddingResults.map((node) => node.id_)
  }
  
  //delete document from collection
  async delete(refDocId: string, deleteOptions?: ChromaDeleteOptions): Promise<void> {
    if (!this.collection) {
      throw new Error('Must initialize collection before deleting')
    }

    try {
      await this.collection.delete({
        ids: [refDocId],
        where: deleteOptions?.where,
        whereDocument: deleteOptions?.whereDocument,
      });
    } catch (err) {
      const msg = `${err}`;
      console.log(msg, err);
      throw err;
    }
  }

  //Query document from ChromaDB collection to get the closest match to given embedding. 
  async query(query: VectorStoreQuery, options?: ChromaQueryOptions): Promise<VectorStoreQueryResult> {
    if (!this.collection) {
      throw new Error("Must connect to collection before querying.");
    }
    if (query.docIds) {
      throw new Error("ChromaDB does not support querying by docIDs");
    }
    if (query.mode != VectorStoreQueryMode.DEFAULT) {
      throw new Error("ChromaDB does not support querying by mode");
    }

    const chromaWhere: { [x: string]: string | number | boolean; } = {};  
    if (query.filters) {
      query.filters.filters.map((filter) => {
        const filterKey = filter.key;
        const filterValue = filter.value;
        chromaWhere[filterKey] = filterValue;
      }
      );
    }
    try {
      const queryResponse = await this.collection.query({
        queryEmbeddings: query.queryEmbedding ?? undefined,
        queryTexts: query.queryStr ?? undefined,
        nResults: query.similarityTopK,
        where: Object.keys(chromaWhere).length ? chromaWhere: undefined, 
        whereDocument: options?.whereDocument,
        //ChromaDB doesn't return the result embeddings by default so we need to include them  
        include: [IncludeEnum.Distances, IncludeEnum.Metadatas, IncludeEnum.Documents, IncludeEnum.Embeddings]
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
        similarities: (queryResponse.distances as number[][])[0].map((distance) => 1 - distance),
        ids: queryResponse.ids[0],
      };
      return vectorStoreQueryResult;
    }
    catch (err) {
      const msg = `${err}`
      console.log(msg, err)
      throw err
    }
  }
}
