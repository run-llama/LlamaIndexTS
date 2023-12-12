import {
  MilvusVectorStore,
  PapaCSVReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { DataType } from '@zilliz/milvus2-sdk-node'

const collectionName = "movie_reviews";

async function main() {
  try {
    const reader = new PapaCSVReader(false);
    const docs = await reader.loadData("milvus/data/movie_reviews.csv");

    const vectorStore = new MilvusVectorStore();

    const milvus = vectorStore.client()


    await milvus.createCollection({
      collection_name: collectionName,
      fields: [
        {
          name: 'reviewid',
          description: 'ID field',
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true,
        },
        {
          name: 'reviewtext',
          data_type: DataType.VarChar,
          max_length: 9000
        },
        {
          name: 'title',
          data_type: DataType.VarChar,
          max_length: 100
        },
        {
          name: 'criticname',
          data_type: DataType.VarChar,
          max_length: 100
        },
        {
          name: 'reviewstate',
          data_type: DataType.VarChar,
          max_length: 20
        },
        {
          name: 'originalscore',
          data_type: DataType.VarChar,
          max_length: 10
        },
        {
          name: 'creationdate',
          data_type: DataType.VarChar,
          max_length: 10
        },
      ],
      vector: { size: 1536, function: "cosine" },
    });
    await vectorStore.connect(collectionName);

    const ctx = await storageContextFromDefaults({ vectorStore });
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });
  } catch (e) {
    console.error(e);
  }
}

main();
