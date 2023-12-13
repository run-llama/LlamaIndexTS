import {
  AstraDBVectorStore,
  PapaCSVReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const reader = new PapaCSVReader(false);
    const docs = await reader.loadData("astradb/data/movie_reviews.csv");

    const astraVS = new AstraDBVectorStore();
    await astraVS.create(collectionName, {
      vector: { dimension: 1536, metric: "cosine" },
    });
    await astraVS.connect(collectionName);

    const ctx = await storageContextFromDefaults({ vectorStore: astraVS });
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });
  } catch (e) {
    console.error(e);
  }
}

main();
