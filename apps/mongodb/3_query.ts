/* eslint-disable turbo/no-undeclared-env-vars */
import "dotenv/config";
import {
  MongoDBAtlasVectorSearch,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  const serviceContext = serviceContextFromDefaults();
  const store = new MongoDBAtlasVectorSearch({
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
  process.exit(0);
}

main();
