process.env.AZURE_OPENAI_ENDPOINT =
  "https://cog-nadwwr3zcwntm.openai.azure.com";
process.env.AZURE_DEPLOYMENT_NAME = "gpt-4o-mini";
process.env.EMBEDDING_MODEL = "text-embedding-3-large";

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
  const endpoint = "https://llamaindex.documents.azure.com:443/";
  const docStore = AzureCosmosNoSqlDocumentStore.fromAadToken({
    endpoint,
  });
  console.log({ docStore });
  const indexStore = AzureCosmosNoSqlIndexStore.fromAadToken({
    endpoint,
  });
  console.log({ indexStore });
  const vectorStore = AzureCosmosDBNoSqlVectorStore.fromAadToken({
    endpoint,
  });
  console.log({ vectorStore });
  const storageContext = await storageContextFromDefaults({
    docStore,
    indexStore,
    // vectorStore,
  });
  console.log({ storageContext });
  const document = new Document({ text: "Test Text" });
  const index = await VectorStoreIndex.fromDocuments([document], {
    storageContext,
    logProgress: true,
  });

  console.log({ index });
})();
