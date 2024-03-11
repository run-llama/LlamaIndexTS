import {
  CallbackManager,
  ImageDocument,
  ImageType,
  MultiModalResponseSynthesizer,
  NodeWithScore,
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
  let images: ImageType[] = [];
  const callbackManager = new CallbackManager({
    onRetrieve: ({ query, nodes }) => {
      images = nodes
        .filter(({ node }: NodeWithScore) => node instanceof ImageDocument)
        .map(({ node }: NodeWithScore) => (node as ImageDocument).image);
    },
  });
  const llm = new OpenAI({ model: "gpt-4-vision-preview", maxTokens: 512 });
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: 512,
    chunkOverlap: 20,
    callbackManager,
  });
  const index = await createIndex(serviceContext);

  const queryEngine = index.asQueryEngine({
    responseSynthesizer: new MultiModalResponseSynthesizer({ serviceContext }),
    retriever: index.asRetriever({ similarityTopK: 3, imageSimilarityTopK: 1 }),
  });
  const result = await queryEngine.query({
    query: "Tell me more about Vincent van Gogh's famous paintings",
  });
  console.log(result.response, "\n");
  images.forEach((image) =>
    console.log(`Image retrieved and used in inference: ${image.toString()}`),
  );
}

main().catch(console.error);
