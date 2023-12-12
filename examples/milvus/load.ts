import {
  MilvusVectorStore,
  PapaCSVReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex"
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
          name: 'id',
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true,
        },
        {
          name: 'embedding',
          data_type: DataType.FloatVector,
          dim: 1536,
        },
        {
          name: 'content',
          data_type: DataType.VarChar,
          max_length: 9000
        },
        {
          name: 'metadata',
          data_type: DataType.JSON
        },
      ],
    });
    await milvus.createIndex({
      collection_name: collectionName,
      field_name: 'vector',
      index_type: 'HNSW',
      params: { efConstruction: 10, M: 4 },
      metric_type: 'L2',
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
