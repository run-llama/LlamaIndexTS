import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';


async function main(){

  const address = 'localhost:19530';

  const client = new MilvusClient({address: address});
  
  //Milvus stuff
  const coll_list = await client.listCollections();
  console.log(coll_list);


  //Low Level





  //High Level

  
};

main();