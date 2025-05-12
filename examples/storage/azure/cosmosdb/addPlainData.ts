import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";
import * as fs from "fs";
// Load environment variables from local .env file
dotenv.config();

const jsonFile = "./data/shortStories.json";
const cosmosEndpoint = process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT!;
const cosmosConnectionString =
  process.env.AZURE_COSMOSDB_NOSQL_CONNECTION_STRING!;
const databaseName =
  process.env.AZURE_COSMOSDB_DATABASE_NAME || "shortStoriesDatabase";
const containerName =
  process.env.AZURE_COSMOSDB_CONTAINER_NAME || "shortStoriesContainer";

async function addDocumentsToCosmosDB() {
  if (!cosmosConnectionString && !cosmosEndpoint) {
    throw new Error(
      "Azure CosmosDB connection string or endpoint must be set.",
    );
  }

  let cosmosClient: CosmosClient;

  const stories = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));

  // initialize the cosmos client
  if (cosmosConnectionString) {
    cosmosClient = new CosmosClient(cosmosConnectionString);
  } else {
    cosmosClient = new CosmosClient({
      endpoint: cosmosEndpoint,
      aadCredentials: new DefaultAzureCredential(),
    });
  }

  // Create a new database and container if they don't exist
  const { database } = await cosmosClient.databases.createIfNotExists({
    id: databaseName,
  });
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: "/id",
  });

  console.log(
    `Data import started to the CosmosDB container ${containerName}.`,
  );
  // Insert the short stories into the CosmosDB container
  for (const story of stories) {
    await container.items.create(story);
  }

  console.log(
    `Successfully imported data to the CosmosDB container ${containerName}.`,
  );
}

addDocumentsToCosmosDB().catch(console.error);
