import {
  Settings,
  SimpleDirectoryReader,
  VectorStoreIndex,
  storageContextFromDefaults,
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
    const storageContext = await storageContextFromDefaults({
      persistDir: "storage",
      storeImages: true,
    });
    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
  });
  console.log(`Storage successfully generated in ${ms / 1000}s.`);
}

async function main() {
  await generateDatasource();
  console.log("Finished generating storage.");
}

main().catch(console.error);
