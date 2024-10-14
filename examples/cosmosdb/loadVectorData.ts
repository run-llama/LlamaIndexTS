/* eslint-disable turbo/no-undeclared-env-vars */
import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";
import {
  AzureCosmosDBNoSqlVectorStore,
  OpenAI,
  OpenAIEmbedding,
  Settings,
  SimpleCosmosDBReader,
  SimpleCosmosReaderLoaderConfig,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

// Load environment variables from local .env file
dotenv.config();

const cosmosEndpoint = process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT!;
const cosmosConnectionString =
  process.env.AZURE_COSMOSDB_NOSQL_CONNECTION_STRING!;
const databaseName =
  process.env.AZURE_COSMOSDB_DATABASE_NAME || "tweetDatabase";
const collectionName =
  process.env.AZURE_COSMOSDB_CONTAINER_NAME || "tweetContainer";
const vectorCollectionName =
  process.env.AZURE_COSMOSDB_VECTOR_CONTAINER_NAME || "vectorContainer";

// This exampple uses Azure OpenAI llm and embedding models
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

async function loadVectorData() {
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

  const reader = new SimpleCosmosDBReader(cosmosClient);
  // create a configuration object for the reader
  const simpleCosmosReaderConfig: SimpleCosmosReaderLoaderConfig = {
    databaseName,
    containerName: collectionName,
    fields: ["text"],
    query: "SELECT c.id, c.full_text as text, c.entities as metadata FROM c",
    metadataFields: ["metadata"],
  };

  // load objects from cosmos and convert them into LlamaIndex Document objects
  const documents = await reader.loadData(simpleCosmosReaderConfig);
  // create Atlas as a vector store
  const vectorStore = new AzureCosmosDBNoSqlVectorStore({
    client: cosmosClient,
    databaseName,
    containerName: vectorCollectionName,
  });

  // Store the embeddings in the CosmosDB container
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(
    `Successfully created embeddings in the CosmosDB container ${vectorCollectionName}.`,
  );
}

loadVectorData().catch(console.error);
