import { TokenCredential } from "@azure/identity";
import {
  AzureCosmosDBNoSQLConfig,
  AzureCosmosDBNoSqlVectorStore,
  AzureCosmosNoSqlDocumentStore,
  AzureCosmosNoSqlIndexStore,
} from "@llamaindex/azure";

/**
 * Util function to create AzureCosmosDB vectorStore, docStore, indexStore from connection string.
 */
export const createStoresFromConnectionString = (
  connectionString: string,
  dbConfig: AzureCosmosDBNoSQLConfig,
) => {
  const vectorStore = AzureCosmosDBNoSqlVectorStore.fromConnectionString({
    connectionString,
    ...dbConfig,
  });
  const docStore = AzureCosmosNoSqlDocumentStore.fromConnectionString({
    connectionString,
  });
  const indexStore = AzureCosmosNoSqlIndexStore.fromConnectionString({
    connectionString,
  });
  return { vectorStore, docStore, indexStore };
};

/**
 * Util function to create AzureCosmosDB vectorStore, docStore, indexStore from connection string.
 */
export const createStoresFromManagedIdentity = (
  endpoint: string,
  credential: TokenCredential,
  dbConfig: AzureCosmosDBNoSQLConfig,
) => {
  const vectorStore = AzureCosmosDBNoSqlVectorStore.fromUriAndManagedIdentity({
    endpoint,
    credential,
    ...dbConfig,
  });
  const docStore = AzureCosmosNoSqlDocumentStore.fromAadToken({
    endpoint,
    credential,
  });
  const indexStore = AzureCosmosNoSqlIndexStore.fromAadToken({
    endpoint,
    credential,
  });
  return { vectorStore, docStore, indexStore };
};
