import {
  ClipEmbedding,
  ModalityType,
  Settings,
  SimpleDirectoryReader,
  SimpleVectorStore,
  VectorStoreIndex,
} from "llamaindex";

import * as path from "path";

// Update chunk size and overlap
Settings.chunkSize = 512;
Settings.chunkOverlap = 20;

async function getRuntime(func: any) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function generateDatasource() {
  console.log(`Generating storage...`);
  // Split documents, create embeddings and store them in the storage context
  const ms = await getRuntime(async () => {
    const documents = await new SimpleDirectoryReader().loadData({
      directoryPath: path.join("multimodal", "data"),
    });
    const clipVectorStore = new SimpleVectorStore({
      embedModel: new ClipEmbedding(),
    });
    // embedding for vector Store defaults to OpenAIEmbedding
    const vectorStore = new SimpleVectorStore();
    await VectorStoreIndex.fromDocuments(documents, {
      vectorStores: {
        [ModalityType.IMAGE]: clipVectorStore,
        [ModalityType.TEXT]: vectorStore,
      },
    });
  });
  console.log(`Storage successfully generated in ${ms / 1000}s.`);
}

async function main() {
  await generateDatasource();
  console.log("Finished generating storage.");
}

main().catch(console.error);
