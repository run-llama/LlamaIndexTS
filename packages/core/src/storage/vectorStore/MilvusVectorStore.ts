import { BaseNode } from '../../Node';
import { GenericFileSystem } from '../FileSystem';
import {VectorStore, VectorStoreQuery, VectorStoreQueryResult} from './types';
import {MilvusClient} from "@zilliz/milvus2-sdk-node";
import { EmbeddingOmissionNode } from '../../Node';


export class MilvusVectorStore implements VectorStore {

  storesText: boolean;
  isEmbeddingQuery?: boolean;
  client: MilvusClient;
  collectionName: string;

  constructor(client: MilvusClient, collectionName: string, storesText?: boolean){
    //Assign params
    this.collectionName = collectionName;
    this.client = client;
    this.storesText = storesText ? storesText : true;
  }


   /**
   * Loads data from MongoDB collection
   * @param {BaseNode[]} embeddingResults - Nodes with embeddings
   * @param {string} embeddingFieldName - The name of the embedding field in Milvus
   */
  async add(embeddingResults: BaseNode[], embeddingFieldName?: string): Promise<string[]>{

    //embeddingField name defaults to "embedding", since BaseNode defaults to that.
    const embeddingField: string = embeddingFieldName ? embeddingFieldName : "embedding";

    //Add all the nodes to Milvus collection.
    //We should be mapping these nodes in-place to save memory.
    await Promise.all(
      embeddingResults.map(
        async embeddingResult => {

          if(!embeddingResult.embedding){
            throw new Error(`Embedding not available for ${embeddingResult}`);
          }

          //Take out our embedding from the embeddingResult easily, using types.
          let resultNoEmbedding: EmbeddingOmissionNode = embeddingResult;
          
          //Insert into Milvus
          const response = await this.client.insert(this.collectionName,
            [{
              embeddingField: embeddingResult.embedding,
            ...resultNoEmbedding
          }]);

          //TODO: Add additional checks later, after we implement Callback features
        }
      )
    );

    return embeddingResults.map((result) => result.id_);
  };

  //TODO: Think about this more before implementing...
  async delete(refDocId: string, deleteKwargs?: any): Promise<void>{
    //Delete all entries associated with a certain Document
    this.client.delete(this.collectionName, [refDocId], ...deleteKwargs);
    return;
  };

  //TODO: Rethink types here, to think idiomatically
  async query(query: VectorStoreQuery, kwargs?: any): Promise<VectorStoreQueryResult>{
    //Find any number of queries, I think
    return;
  };


  //TODO: This method should be optional I think.
  async persist(persistPath: string, fs?: GenericFileSystem): Promise<void> {

    //I don't think we need to persist(?)
    return;
  };

}