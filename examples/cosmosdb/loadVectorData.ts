import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import {
  SimpleCosmosDBReader,
  SimpleCosmosDBReaderLoaderConfig,
} from "@llamaindex/readers/cosmosdb";
import * as dotenv from "dotenv";
import {
  AzureCosmosDBNoSQLConfig,
  OpenAI,
  OpenAIEmbedding,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import {
  createStoresFromConnectionString,
  createStoresFromManagedIdentity,
} from "./utils";
// Load environment variables from local .env file
dotenv.config();

const cosmosEndpoint = process.env.AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT!;
const cosmosConnectionString =
  process.env.AZURE_COSMOSDB_NOSQL_CONNECTION_STRING!;
const databaseName =
  process.env.AZURE_COSMOSDB_DATABASE_NAME || "shortStoriesDatabase";
const collectionName =
  process.env.AZURE_COSMOSDB_CONTAINER_NAME || "shortStoriesContainer";
const vectorCollectionName =
  process.env.AZURE_COSMOSDB_VECTOR_CONTAINER_NAME || "vectorContainer";

// This example uses Azure OpenAI llm and embedding models
const llmInit = {
  azure: {
    apiVersion: process.env.AZURE_OPENAI_LLM_API_VERSION,
    endpoint: process.env.AZURE_OPENAI_LLM_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_LLM_API_KEY,
  },
};

const embedModelInit = {
  azure: {
    apiVersion: process.env.AZURE_OPENAI_EMBEDDING_API_VERSION,
    endpoint: process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_EMBEDDING_API_KEY,
  },
};

Settings.llm = new OpenAI(llmInit);
Settings.embedModel = new OpenAIEmbedding(embedModelInit);

// Initialize the CosmosDB client
async function initializeCosmosClient() {
  if (cosmosConnectionString) {
    return new CosmosClient(cosmosConnectionString);
  } else {
    const credential = new DefaultAzureCredential();
    return new CosmosClient({
      endpoint: cosmosEndpoint,
      aadCredentials: credential,
    });
  }
}

// Initialize CosmosDB to be used as a vectorStore, docStore, and indexStore
async function initializeStores() {
  // Create a configuration object for the Azure CosmosDB NoSQL Vector Store
  const dbConfig: AzureCosmosDBNoSQLConfig = {
    databaseName,
    containerName: vectorCollectionName,
    flatMetadata: false,
  };

  if (cosmosConnectionString) {
    return createStoresFromConnectionString(cosmosConnectionString, dbConfig);
  } else {
    // Use managed identity to authenticate with Azure CosmosDB
    const credential = new DefaultAzureCredential();
    return createStoresFromManagedIdentity(
      cosmosEndpoint,
      credential,
      dbConfig,
    );
  }
}

async function loadVectorData() {
  if (!cosmosConnectionString && !cosmosEndpoint) {
    throw new Error(
      "Azure CosmosDB connection string or endpoint must be set.",
    );
  }
  const cosmosClient = await initializeCosmosClient();
  const reader = new SimpleCosmosDBReader(cosmosClient);
  // create a configuration object for the reader
  const simpleCosmosReaderConfig: SimpleCosmosDBReaderLoaderConfig = {
    databaseName,
    containerName: collectionName,
    fields: ["text"],
    query: "SELECT c.id, c.text as text, c.metadata as metadata FROM c",
    metadataFields: ["metadata"],
  };

  // load objects from cosmos and convert them into LlamaIndex Document objects
  const documents = await reader.loadData(simpleCosmosReaderConfig);

  // use Azure CosmosDB as a vectorStore, docStore, and indexStore
  const { vectorStore, docStore, indexStore } = await initializeStores();
  // Store the embeddings in the CosmosDB container
  const storageContext = await storageContextFromDefaults({
    vectorStore,
    docStore,
    indexStore,
  });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(
    `Successfully created embeddings in the CosmosDB container ${vectorCollectionName}.`,
  );
}

loadVectorData().catch(console.error);
