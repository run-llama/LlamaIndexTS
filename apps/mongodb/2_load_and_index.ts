/* eslint-disable turbo/no-undeclared-env-vars */
import "dotenv/config";
import {
  MongoDBAtlasVectorSearch,
  SimpleMongoReader,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import { MongoClient } from "mongodb";

// Create a new client and connect to the server
const client = new MongoClient(process.env.MONGODB_URI!);
// load objects from mongo and convert them into LlamaIndex Document objects
// llamaindex has a special class that does this for you
// it pulls every object in a given collection
const MR = new SimpleMongoReader(client);
const documents = await MR.loadData("data", "posts");

// create Atlas as a vector store
const vectorStore = new MongoDBAtlasVectorSearch({
  mongodbClient: client,
  dbName: process.env.MONGODB_DATABASE!,
  collectionName: process.env.MONGODB_VECTORS!, // this is where your embeddings will be stored
  indexName: process.env.MONGODB_VECTOR_INDEX, // this is the name of the index you will need to create
});

// now create an index from all the Documents and store them in Atlas
const storageContext = await storageContextFromDefaults({ vectorStore });
VectorStoreIndex.fromDocuments(documents, { storageContext });

// you can't query your index yet because you need to create a vector search index in mongodb's UI now
