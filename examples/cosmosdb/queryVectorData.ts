import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
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
const containerName =
  process.env.AZURE_COSMOSDB_VECTOR_CONTAINER_NAME || "vectorContainer";

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

async function initializeStores() {
  // Create a configuration object for the Azure CosmosDB NoSQL Vector Store
  const dbConfig: AzureCosmosDBNoSQLConfig = {
    databaseName,
    containerName,
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

async function query() {
  if (!cosmosConnectionString && !cosmosEndpoint) {
    throw new Error(
      "Azure CosmosDB connection string or endpoint must be set.",
    );
  }

  let cosmosClient: CosmosClient;
  // initialize the cosmos client
  if (cosmosConnectionString) {
    cosmosClient = new CosmosClient(cosmosConnectionString);
  } else {
    cosmosClient = new CosmosClient({
      endpoint: cosmosEndpoint,
      aadCredentials: new DefaultAzureCredential(),
    });
  }

  // use Azure CosmosDB as a vectorStore, docStore, and indexStore
  const { vectorStore, docStore, indexStore } = await initializeStores();

  // Store the embeddings in the CosmosDB container
  const storageContext = await storageContextFromDefaults({
    vectorStore,
    docStore,
    indexStore,
  });

  // create an index from the Azure CosmosDB NoSQL Vector Store
  const index = await VectorStoreIndex.init({ storageContext });

  // create a retriever and a query engine from the index
  const retriever = index.asRetriever({ similarityTopK: 20 });
  const queryEngine = index.asQueryEngine({ retriever });

  const result = await queryEngine.query({
    query: "Who all jog?", // Cosmo, Ludo, Maud, Hale, Constance, Garrison, Fergus, Rafe, Waverly, Rex, Loveday
  });
  console.log(result.message);
}

void query();
