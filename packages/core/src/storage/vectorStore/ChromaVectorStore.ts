import { VectorStore, VectorStoreQuery, VectorStoreQueryResult } from "./types";
import { OpenAIEmbeddingFunction } from 'chromadb'
import { BaseNode, Document, MetadataMode } from "../../Node";

import { ChromaClient, Collection } from 'chromadb'

const client = new ChromaClient();
const MAX_INSERT_BATCH_SIZE = 20;




export class ChromaVectorStore implements VectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;

  chromaClient: ChromaClient
  collectionName: string
  idKey: string
  metadataKey: string
  contentKey: string | undefined

  
  private collection: Collection | undefined;

  constructor(
    init?: Partial<ChromaVectorStore> & {
      params?: {
        // Add necessary ChromaDB connection parameters
      };
    },
  ) {
    this.chromaClient = new ChromaClient();
    this.collectionName = init?.collectionName ?? "default_collection";
    this.idKey = init?.idKey ?? "_id";
    this.contentKey = init?.contentKey;
    this.metadataKey = init?.metadataKey ?? "metadata";
  }

  async create(collectionName: string): Promise<void> {
    await this.chromaClient.createCollection({
      name: collectionName
    });
    console.debug('Created ChromaDB collection')
  }

  async connect(collectionName: string): Promise<void> {
    this.collection = await this.chromaClient.getCollection({
      name: collectionName,
    });
    console.debug('Connected to ChromaDB collection');
  }

  client(): ChromaClient {
    return this.chromaClient;
  }

  //add document to chromadb collection 
  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!this.collection) {
      throw new Error("Must connect to collection before adding.")
    }

    const collection = this.collection;
    if (!nodes || nodes.length == 0) {
      return [];
    }

    const dataToInsert = nodes.map((node) => {
      return {
        _id: node.id_,
        $vector: node.getEmbedding(),
        content: node.getContent(MetadataMode.ALL),
        metadata: node.metadata,
      };
    });

    console.debug(`Adding ${dataToInsert.length} rows to table`);

    let batchData: any[] = [];
    for (let i = 0; i < dataToInsert.length; i += MAX_INSERT_BATCH_SIZE) {
      batchData.push(dataToInsert.slice(i, i + MAX_INSERT_BATCH_SIZE));
    }

    for (const batch of batchData) {
      console.debug(`Inserting batch of size ${batch.length}`);
      await this.collection.add(batch);
    }

    return dataToInsert.map((node) => node._id);
  }

  //delete document from collection 
  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    if (!this.collection) {
      throw new Error('Must connect to collection before deleting')
    }

    console.debug('Deleting row with id $(refDocID)');

    await this.collection.delete({
      ids: [refDocId],
      where: deleteOptions,
    });
  }

  //query document from chromadb collection to get closest match to embedding 
  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    throw new Error('query method is not implemented yet');
  }

}