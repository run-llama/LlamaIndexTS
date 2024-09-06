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

  const FILTER_METADATA_FIELD = "content_type";

  documents.forEach((document, index) => {
    const contentType = ["tweet", "post", "story"][index % 3]; // assign a random content type to each document
    document.metadata = {
      ...document.metadata,
      [FILTER_METADATA_FIELD]: contentType,
    };
  });

  // create Atlas as a vector store
  const vectorStore = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: databaseName,
    collectionName: vectorCollectionName, // this is where your embeddings will be stored
    indexName: indexName, // this is the name of the index you will need to create
    indexedMetadataFields: [FILTER_METADATA_FIELD], // this is the field that will be used for the query
  });

  // now create an index from all the Documents and store them in Atlas
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(
    `Successfully created embeddings in the MongoDB collection ${vectorCollectionName}.`,
  );
  await client.close();
}

loadAndIndex().catch(console.error);
