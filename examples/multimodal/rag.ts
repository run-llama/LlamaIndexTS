import {
  MultiModalResponseSynthesizer,
  OpenAI,
  ServiceContext,
  VectorStoreIndex,
  serviceContextFromDefaults,
  storageContextFromDefaults,
} from "llamaindex";

export async function createIndex(serviceContext: ServiceContext) {
  // set up vector store index with two vector stores, one for text, the other for images
  const storageContext = await storageContextFromDefaults({
    persistDir: "storage",
    storeImages: true,
  });
  return await VectorStoreIndex.init({
    nodes: [],
    storageContext,
    serviceContext,
  });
}

async function main() {
  const llm = new OpenAI({ model: "gpt-4-vision-preview", maxTokens: 512 });
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: 512,
    chunkOverlap: 20,
  });
  const index = await createIndex(serviceContext);

  const queryEngine = index.asQueryEngine({
    responseSynthesizer: new MultiModalResponseSynthesizer({ serviceContext }),
    // TODO: set imageSimilarityTopK: 1,
    retriever: index.asRetriever({ similarityTopK: 2 }),
  });
  const result = await queryEngine.query(
    "what are Vincent van Gogh's famous paintings",
  );
  console.log(result.response);
}

main().catch(console.error);
