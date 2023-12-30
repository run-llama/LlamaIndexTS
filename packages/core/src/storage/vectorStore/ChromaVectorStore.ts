import { VectorStore, VectorStoreQuery, VectorStoreQueryResult } from "./types";
import { BaseNode, Document, MetadataMode } from "../../Node";
import { ChromaClient, Collection } from 'chromadb'

export class ChromaVectorStore implements VectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;

  chromaClient: ChromaClient;
  collectionName: string;
  embeddingKey: string;
  idKey: string;
  textKey: string;
  metadataKey: string;
  contentKey: string | undefined;
  private collection: Collection | undefined;

  constructor(init?: Partial<ChromaVectorStore> & { params?: {} }) {
    this.chromaClient = new ChromaClient();
    this.collectionName = init?.collectionName ?? "default_collection";
    this.idKey = init?.idKey ?? "_id";
    this.textKey = init?.textKey ?? "text";
    this.embeddingKey = init?.embeddingKey ?? "embedding";
    this.contentKey = init?.contentKey;
    this.metadataKey = init?.metadataKey ?? "metadata";
  }

  //Create a new collection
  async create(collectionName: string): Promise<void> {
    await this.chromaClient.createCollection({
      name: collectionName
    });
  }
  
  //Connect to existing ChromaDB collection
  async connect(collectionName: string): Promise<void> {
    this.collection = await this.chromaClient.getCollection({
      name: collectionName,
    });
  }

  client(): ChromaClient {
    return this.chromaClient;
  }

  //Add document to ChromaDB collection
  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!this.collection) {
        throw new Error("Must connect to collection before adding.");
    }

    if (!nodes || nodes.length === 0) {
        return [];
    }

    const dataToInsert = {
        ids: nodes.map((node) => node.id_),
        embeddings: nodes.map((node) => node.getEmbedding()),
        metadatas: nodes.map((node) => node.metadata),
        documents: nodes.map((node) => node.getContent(MetadataMode.ALL)),
    };

    const result = await this.collection.add(dataToInsert);
    const insertedIds: string[] = [];

    return insertedIds;
  }
  
  //delete document from collection
  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    if (!this.collection) {
      throw new Error('Must connect to collection before deleting')
    }

    await this.collection.delete({
      ids: [refDocId],
      where: deleteOptions,
    });
  }

  //Query document from ChromaDB collection to get the closest match to given embedding. 
  async query(query: VectorStoreQuery, options?: any): Promise<VectorStoreQueryResult> {
    if (!this.collection) {
      throw new Error("Must connect to collection before querying.");
    }
  
    const result = await this.collection.query({
      queryEmbeddings: query.queryEmbedding,
      nResults: query.similarityTopK,
    });
  
    const rows: any[] = Array.isArray(result) ? result : [result];
  
    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];
  
    for (const row of rows) {
      const id = row._id;
      const embedding = row.$vector;
      const similarity = row.$similarity;
      const metadata = row.metadata;
      const content = row.content || JSON.stringify(row);
      
      const node = new Document({
        id_: id,
        text: content,
        metadata: metadata ?? {},
        embedding: embedding,
      });
  
      ids.push(id);
      similarities.push(similarity);
      nodes.push(node);
    }
  
    return {
      similarities,
      ids,
      nodes,
    };
  }
}