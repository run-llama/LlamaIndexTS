import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
import {Document} from "llamaindex";
import {MilvusVectorStore}  from "../../packages/core/src/storage/vectorStore/MilvusVectorStore";
import essay from "./essay";

async function main(){

  const address = 'localhost:19530';
  const collectionName: string = "something";
  // const client = await new MilvusClient({address: address});
  

  const document = new Document({ text: essay, id_: "essay"});
  //TODO: Generate embedded nodes, and print. We need to see what we're working with.
  


  //Milvus stuff

  //Create Collection
  //TODO: Make it easy to make a Milvus collection based on LlamaIndex types
  
  // const params = {
  //   collection_name: "something",
  //   description: "Test Essay search",
  //   fields: [
  //     {
  //       name: "title",
  //       data_type: DataType.VarChar,
  //       max_length: 256,
  //       description: "Essay Title",
  //     }
  //   ],
  //   enableDynamicField: true
  // };

  // await client.createCollection(params);


  // //List collections
  // const coll_list = await client.listCollections();
  // console.log(coll_list);
  // // console.log(client);

  // const vs: MilvusVectorStore = new MilvusVectorStore(client, "something");
  //Low Level





  //High Level

  
};

main();