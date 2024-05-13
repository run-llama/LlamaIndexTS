import {
  CallbackManager,
  ImageType,
  MultiModalResponseSynthesizer,
  OpenAI,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { getStorageContext } from "./storage";

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

async function main() {
  const images: ImageType[] = [];

  const storageContext = await getStorageContext();
  const index = await VectorStoreIndex.init({
    nodes: [],
    storageContext,
  });

  const queryEngine = index.asQueryEngine({
    responseSynthesizer: new MultiModalResponseSynthesizer(),
    retriever: index.asRetriever({ topK: { TEXT: 3, IMAGE: 1 } }),
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
