import "dotenv/config";

import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import {
  AzureCosmosDBNoSqlVectorStore,
  AzureCosmosNoSqlDocumentStore,
  AzureCosmosNoSqlIndexStore,
  Document,
  OpenAI,
  OpenAIEmbedding,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
/**
 * This example demonstrates how to use Azure CosmosDB with LlamaIndex.
 * It uses Azure CosmosDB as IndexStore, DocumentStore, and VectorStore.
 *
 * To run this example, create an .env file under /examples and set the following environment variables:
 *
 * AZURE_OPENAI_ENDPOINT="https://AOAI-ACCOUNT.openai.azure.com" // Sample Azure OpenAI endpoint.
 * AZURE_DEPLOYMENT_NAME="gpt-4o" // Sample Azure OpenAI deployment name.
 * EMBEDDING_MODEL="text-embedding-3-large" // Sample Azure OpenAI embedding model.
 * AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT = "https://DB-ACCOUNT.documents.azure.com:443/" // Sample CosmosDB account endpoint.
 *
 * This example uses managed identity to authenticate with Azure CosmosDB and Azure OpenAI. Make sure to assign the required roles to the managed identity.
 * You can also use connectionString for Azure CosmosDB and Keys with Azure OpenAI for authentication.
 */
(async () => {
  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    "https://cognitiveservices.azure.com/.default",
  );

  const azure = {
    azureADTokenProvider,
    deployment: process.env.AZURE_DEPLOYMENT_NAME,
  };
  Settings.llm = new OpenAI({ azure });
  Settings.embedModel = new OpenAIEmbedding({
    model: process.env.EMBEDDING_MODEL,
    azure: {
      ...azure,
      deployment: process.env.EMBEDDING_MODEL,
    },
  });
  const docStore = AzureCosmosNoSqlDocumentStore.fromAadToken();
  console.log({ docStore });
  const indexStore = AzureCosmosNoSqlIndexStore.fromAadToken();
  console.log({ indexStore });
  const vectorStore = AzureCosmosDBNoSqlVectorStore.fromUriAndManagedIdentity();
  console.log({ vectorStore });
  const storageContext = await storageContextFromDefaults({
    docStore,
    indexStore,
    vectorStore,
  });
  console.log({ storageContext });

  const document = new Document({ text: "Test Text" });
  const index = await VectorStoreIndex.fromDocuments([document], {
    storageContext,
    logProgress: true,
  });

  console.log({ index });
})();
