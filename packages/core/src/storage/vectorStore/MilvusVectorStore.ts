import { BaseNode } from '../../Node';
import { GenericFileSystem } from '../FileSystem';
import {VectorStore, VectorStoreQuery, VectorStoreQueryResult} from './types';
import {MilvusClient} from "@zilliz/milvus2-sdk-node";


export class MilvusVectorStore implements VectorStore {

  storesText: boolean;
  isEmbeddingQuery?: boolean;
  client: MilvusClient;
  collectionName: string;
  docIdField: string;

  constructor(client: MilvusClient, collectionName: string, docIdField?: string, storesText?: boolean){
    //Assign params
    this.collectionName = collectionName;
    this.client = client;
    this.docIdField = docIdField ? docIdField : "id_";
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
          let resultNoEmbedding: Omit<BaseNode, "embedding"> = embeddingResult;
          
          //Insert into Milvus
          //TODO: Elliot, fix this :)
          const response = await this.client.insert({collection_name: this.collectionName,
            fields_data: [{
              embeddingField: embeddingResult.embedding,
              ...resultNoEmbedding
          }]});

          //TODO: Add additional checks later, after we implement Callback features
        }
      )
    );

    return embeddingResults.map((result) => result.id_);
  };

  //TODO: Think about this more before implementing...
  async delete(refDocId: string, deleteKwargs?: any): Promise<void>{
    //Delete all entries based on an expression
    //For Milvus, "refDocId" is equivalent to "expr" in the Milvus NodeJS docs

    //TODO: Restructure this expression...
    //Something about the logic is fishy :(



    //Current Python logic:
    // Query relevant docs -> find docId -> erase them


    //Query relevant docs
    // const filter: string = `${this.docIdField} in ${refDocId}`;
    // const entries = this.client.query(
    //   this.collectionName,
    //   filter
    // );

    // console.log(entries);
    

    return;
  };

  //TODO: Rethink types here, to think idiomatically
  async query(query: VectorStoreQuery, kwargs?: any): Promise<VectorStoreQueryResult>{
    //Find any number of queries, I think

    const result: VectorStoreQueryResult = {similarities: [0], ids: ["something"]};
    return await result;
  };


  //TODO: This method should be optional I think.
  async persist(persistPath: string, fs?: GenericFileSystem): Promise<void> {

    //I don't think we need to persist(?)
    return;
  };

}