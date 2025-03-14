import {
  CosmosClient,
  VectorEmbeddingDataType,
  VectorEmbeddingDistanceFunction,
  VectorIndexType,
} from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";
import {
  AzureCosmosDBNoSqlVectorStore,
  Document,
  OpenAI,
  OpenAIEmbedding,
  Settings,
  VectorStoreQueryMode,
  type AzureCosmosDBNoSQLConfig,
  type AzureCosmosQueryOptions,
  type VectorStoreQueryResult,
} from "llamaindex";
import { beforeAll, describe, expect, it } from "vitest";
dotenv.config();
/*
 * To run this test, you need have an Azure Cosmos DB for NoSQL instance
 * running. You can deploy a free version on Azure Portal without any cost,
 * following this guide:
 * https://learn.microsoft.com/azure/cosmos-db/nosql/vector-search
 *
 * You do not need to create a database or collection, it will be created
 * automatically by the test.
 *
 * Once you have the instance running, you need to set the following environment
 * variables before running the test:
 * - AZURE_COSMOSDB_NOSQL_CONNECTION_STRING or AZURE_COSMOSDB_NOSQL_ENDPOINT
 * - AZURE_OPENAI_LLM_API_VERSION
 * - AZURE_OPENAI_LLM_ENDPOINT
 * - AZURE_OPENAI_LLM_API_KEY
 * - AZURE_OPENAI_EMBEDDING_API_VERSION
 * - AZURE_OPENAI_EMBEDDING_ENDPOINT
 * - AZURE_OPENAI_EMBEDDING_API_KEY
 *
 * To use regular OpenAI instead of Azure OpenAI, configure the Settings.llm and Settings.embedModel accordingly.
 */

const DATABASE_NAME = "llamaIndexTestDatabase";
const CONTAINER_NAME = "testContainer";
let client: CosmosClient;

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
// This test is skipped because it requires an Azure Cosmos DB instance and OpenAI API keys
describe.skip("AzureCosmosDBNoSQLVectorStore", () => {
  let vectorStore: AzureCosmosDBNoSqlVectorStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let embeddings: any = [];
  beforeAll(async () => {
    if (process.env.AZURE_COSMOSDB_NOSQL_CONNECTION_STRING) {
      client = new CosmosClient(
        process.env.AZURE_COSMOSDB_NOSQL_CONNECTION_STRING,
      );
    } else if (process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT) {
      client = new CosmosClient({
        endpoint: process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT,
        aadCredentials: new DefaultAzureCredential(),
      });
    } else {
      throw new Error(
        "Please set the environment variable AZURE_COSMOSDB_NOSQL_CONNECTION_STRING or AZURE_COSMOSDB_NOSQL_ENDPOINT",
      );
    }
    // Make sure the database does not exists
    try {
      await client.database(DATABASE_NAME).delete();
    } catch {
      // Ignore error if the database does not exist
    }
    const config: AzureCosmosDBNoSQLConfig = {
      idKey: "name",
      textKey: "customText",
      metadataKey: "customMetadata",
      client: client,
      databaseName: DATABASE_NAME,
      containerName: CONTAINER_NAME,
      createContainerOptions: {
        throughput: 1000,
        partitionKey: { paths: ["/key"] },
      },
      vectorEmbeddingPolicy: {
        vectorEmbeddings: [
          {
            path: "/vector",
            dataType: VectorEmbeddingDataType.Float32,
            distanceFunction: VectorEmbeddingDistanceFunction.Euclidean,
            dimensions: 1000,
          },
        ],
      },
      indexingPolicy: {
        indexingMode: "consistent",
        automatic: true,
        includedPaths: [
          {
            path: "/*",
          },
        ],
        excludedPaths: [
          {
            path: "/_etag/?",
          },
          {
            path: "/metadata/?",
          },
        ],
        vectorIndexes: [
          {
            path: "/vector",
            type: VectorIndexType.QuantizedFlat,
          },
        ],
      },
    };

    vectorStore = new AzureCosmosDBNoSqlVectorStore(config);

    embeddings = await Settings.embedModel.getTextEmbeddings([
      "This book is about politics",
      "Cats sleeps a lot.",
      "Sandwiches taste good.",
      "The house is open",
      "Sandwich",
    ]);

    expect(vectorStore).toBeDefined();
    await vectorStore.add([
      new Document({
        id_: "1",
        text: "This book is about politics",
        embedding: embeddings[0],
        metadata: { key: "politics", number: 1 },
      }),
      new Document({
        id_: "2",
        text: "Cats sleeps a lot.",
        embedding: embeddings[1],
        metadata: { key: "cats", number: 2 },
      }),
      new Document({
        id_: "3",
        text: "Sandwiches taste good.",
        embedding: embeddings[2],
        metadata: { key: "sandwiches", number: 3 },
      }),
      new Document({
        id_: "4",
        text: "The house is open",
        embedding: embeddings[3],
        metadata: { key: "house", number: 4 },
      }),
    ]);
  });
  it("perform query", async () => {
    const results: VectorStoreQueryResult = await vectorStore.query({
      queryEmbedding: embeddings[4] || [],
      similarityTopK: 1,
      mode: VectorStoreQueryMode.DEFAULT,
    });
    expect(results.ids.length).toEqual(1);
    expect(results.ids[0]).toEqual("3");
    expect(results.similarities).toBeDefined();
    expect(results.similarities[0]).toBeDefined();
  }, 1000000);

  it("perform query with where clause", async () => {
    const options: AzureCosmosQueryOptions = {
      whereClause: "c.customMetadata.number > 3",
    };
    const results: VectorStoreQueryResult = await vectorStore.query(
      {
        queryEmbedding: embeddings[4] || [],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
      },
      options,
    );
    expect(results.ids.length).toEqual(1);
    expect(results.ids[0]).toEqual("4");
    expect(results.similarities).toBeDefined();
    expect(results.similarities[0]).toBeDefined();
  }, 1000000);

  it("perform query with includeVectorDistance false", async () => {
    const options: AzureCosmosQueryOptions = {
      includeVectorDistance: false,
    };
    const results: VectorStoreQueryResult = await vectorStore.query(
      {
        queryEmbedding: embeddings[4] || [],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
      },
      options,
    );
    expect(results.ids.length).toEqual(1);
    expect(results.ids[0]).toEqual("3");
    expect(results.similarities).toBeDefined();
    expect(results.similarities[0]).toBeUndefined();
  }, 1000000);

  it("perform query with includeVectorDistance false and whereClause", async () => {
    const options: AzureCosmosQueryOptions = {
      includeVectorDistance: false,
      whereClause: "c.customMetadata.number > 3",
    };
    const results: VectorStoreQueryResult = await vectorStore.query(
      {
        queryEmbedding: embeddings[4] || [],
        similarityTopK: 1,
        mode: VectorStoreQueryMode.DEFAULT,
      },
      options,
    );
    expect(results.ids.length).toEqual(1);
    expect(results.ids[0]).toEqual("4");
    expect(results.similarities).toBeDefined();
    expect(results.similarities[0]).toBeUndefined();
  }, 1000000);
});
