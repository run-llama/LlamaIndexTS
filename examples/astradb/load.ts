import { VectorStoreIndex } from "../../packages/core/src/indices/vectorStore/VectorStoreIndex";
import { PapaCSVReader } from "../../packages/core/src/readers/CSVReader";
import { storageContextFromDefaults } from "../../packages/core/src/storage";
import { AstraDBVectorStore } from "../../packages/core/src/storage/vectorStore/AstraDBVectorStore";

const collectionName = "movie_reviews";

async function main() {
  try {
    const reader = new PapaCSVReader(false);
    const docs = await reader.loadData("astradb/data/movie_reviews.csv");

    const astraVS = new AstraDBVectorStore();
    await astraVS.create(collectionName, {
      vector: { size: 1536, function: "cosine" },
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
