/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";
import {
  MongoDBAtlasVectorSearch,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import { MongoClient } from "mongodb";

// Load environment variables from local .env file
dotenv.config();

async function query() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  const serviceContext = serviceContextFromDefaults();
  const store = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: process.env.MONGODB_DATABASE!,
    collectionName: process.env.MONGODB_VECTORS!,
    indexName: process.env.MONGODB_VECTOR_INDEX!,
  });

  const index = await VectorStoreIndex.fromVectorStore(store, serviceContext);

  const retriever = index.asRetriever({ similarityTopK: 20 });
  const queryEngine = index.asQueryEngine({ retriever });
  const response = await queryEngine.query(
    "What does the author think of web frameworks?",
  );
  console.log(response);
  await client.close();
}

query();
