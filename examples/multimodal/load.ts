import {
  ServiceContext,
  serviceContextFromDefaults,
  SimpleDirectoryReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import * as path from "path";

async function getRuntime(func: any) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function generateDatasource(serviceContext: ServiceContext) {
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
      serviceContext,
      storageContext,
    });
  });
  console.log(`Storage successfully generated in ${ms / 1000}s.`);
}

async function main() {
  const serviceContext = serviceContextFromDefaults({
    chunkSize: 512,
    chunkOverlap: 20,
  });

  await generateDatasource(serviceContext);
  console.log("Finished generating storage.");
}

main().catch(console.error);
