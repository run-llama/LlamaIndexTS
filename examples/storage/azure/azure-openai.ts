import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAI, AzureOpenAIEmbedding } from "@llamaindex/azure";
import "dotenv/config";

const AZURE_COGNITIVE_SERVICES_SCOPE =
  "https://cognitiveservices.azure.com/.default";

(async () => {
  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    AZURE_COGNITIVE_SERVICES_SCOPE,
  );

  const llm = new AzureOpenAI({
    azureADTokenProvider,
    deployment: process.env.AZURE_DEPLOYMENT_NAME ?? "gpt-35-turbo",
  });
  // complete api
  const response1 = await llm.complete({ prompt: "How are you?" });
  console.log(response1.text);

  // chat api
  const response2 = await llm.chat({
    messages: [{ content: "Tell me a joke.", role: "user" }],
  });
  console.log(response2.message.content);

  // embeddings
  const embedModel = new AzureOpenAIEmbedding({
    azureADTokenProvider,
    deployment: process.env.EMBEDDING_MODEL,
  });

  const texts = ["hello", "world"];
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
})();
