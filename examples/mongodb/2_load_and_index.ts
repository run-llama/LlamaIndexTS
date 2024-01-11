/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";
import {
  MongoDBAtlasVectorSearch,
  SimpleMongoReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { MongoClient } from "mongodb";

// Load environment variables from local .env file
dotenv.config();

const mongoUri = process.env.MONGODB_URI!;
const databaseName = process.env.MONGODB_DATABASE!;
const collectionName = process.env.MONGODB_COLLECTION!;
const vectorCollectionName = process.env.MONGODB_VECTORS!;
const indexName = process.env.MONGODB_VECTOR_INDEX!;

async function loadAndIndex() {
  // Create a new client and connect to the server
  const client = new MongoClient(mongoUri);
  // load objects from mongo and convert them into LlamaIndex Document objects
  // llamaindex has a special class that does this for you
  // it pulls every object in a given collection
  const reader = new SimpleMongoReader(client);
  const documents = await reader.loadData(databaseName, collectionName, [
    "full_text",
  ]);

  // create Atlas as a vector store
  const vectorStore = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: databaseName,
    collectionName: vectorCollectionName, // this is where your embeddings will be stored
    indexName: indexName, // this is the name of the index you will need to create
  });

  // now create an index from all the Documents and store them in Atlas
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(
    `Successfully created embeddings in the MongoDB collection ${vectorCollectionName}.`,
  );
  await client.close();
}

/**
 * This method is document in https://www.mongodb.com/docs/atlas/atlas-search/create-index/#create-an-fts-index-programmatically
 * But, while testing a 'CommandNotFound' error occurred, so we're not using this here.
 */
async function createSearchIndex() {
  const client = new MongoClient(mongoUri);
  const database = client.db(databaseName);
  const collection = database.collection(vectorCollectionName);

  // define your Atlas Search index
  const index = {
    name: indexName,
    definition: {
      /* search index definition fields */
      mappings: {
        dynamic: true,
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 1536,
            similarity: "cosine",
          },
        ],
      },
    },
  };
  // run the helper method
  const result = await collection.createSearchIndex(index);
  console.log("Successfully created search index:", result);
  await client.close();
}

loadAndIndex().catch(console.error);

// you can't query your index yet because you need to create a vector search index in mongodb's UI now
