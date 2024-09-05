/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";
import { MongoDBAtlasVectorSearch, VectorStoreIndex } from "llamaindex";
import { MongoClient } from "mongodb";

// Load environment variables from local .env file
dotenv.config();

async function query() {
  const client = new MongoClient(process.env.MONGODB_URI!);

  const store = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: process.env.MONGODB_DATABASE!,
    collectionName: process.env.MONGODB_VECTORS!,
    indexName: process.env.MONGODB_VECTOR_INDEX!,
    indexedMetadataFields: ["content_type"],
  });

  const index = await VectorStoreIndex.fromVectorStore(store);

  const retriever = index.asRetriever({ similarityTopK: 20 });
  const queryEngine = index.asQueryEngine({
    retriever,
    preFilters: {
      filters: [
        {
          key: "content_type",
          value: "story", // try "tweet" or "post" to see the difference
          operator: "==",
        },
      ],
    },
  });
  const result = await queryEngine.query({
    query: "What does author receive when he was 11 years old?", // Isaac Asimov's "Foundation" for Christmas
  });
  console.log(result.response);
  await client.close();
}

void query();
