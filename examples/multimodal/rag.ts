import {
  CallbackManager,
  ImageType,
  MultiModalResponseSynthesizer,
  OpenAI,
  Settings,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

// Update chunk size and overlap
Settings.chunkSize = 512;
Settings.chunkOverlap = 20;

// Update llm
Settings.llm = new OpenAI({ model: "gpt-4-turbo", maxTokens: 512 });

// Update callbackManager
Settings.callbackManager = new CallbackManager({
  onRetrieve: ({ query, nodes }) => {
    console.log(`Retrieved ${nodes.length} nodes for query: ${query}`);
  },
});

export async function createIndex() {
  // set up vector store index with two vector stores, one for text, the other for images
  const storageContext = await storageContextFromDefaults({
    persistDir: "storage",
    storeImages: true,
  });
  return await VectorStoreIndex.init({
    nodes: [],
    storageContext,
  });
}

async function main() {
  const images: ImageType[] = [];

  const index = await createIndex();

  const queryEngine = index.asQueryEngine({
    responseSynthesizer: new MultiModalResponseSynthesizer(),
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
