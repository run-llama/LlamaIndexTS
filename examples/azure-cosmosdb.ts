import "dotenv/config";

import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import {
  AzureCosmosDBNoSqlVectorStore,
  AzureCosmosNoSqlDocumentStore,
  Document,
  OpenAI,
  OpenAIEmbedding,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { AzureCosmosNoSqlIndexStore } from "llamaindex/storage/indexStore/AzureCosmosNoSqlIndexStore";

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
  const vectorStore = AzureCosmosDBNoSqlVectorStore.fromAadToken();
  console.log({ vectorStore });
  const storageContext = await storageContextFromDefaults({
    docStore,
    indexStore,
    vectorStores: {
      ["TEXT"]: vectorStore,
    },
  });
  console.log({ storageContext });

  const document = new Document({ text: "Test Text" });
  const index = await VectorStoreIndex.fromDocuments([document], {
    storageContext,
    logProgress: true,
  });

  console.log({ index });
})();
