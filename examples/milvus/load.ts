import { MilvusVectorStore } from "@llamaindex/milvus";
import { CSVReader } from "@llamaindex/readers/csv";
import { storageContextFromDefaults, VectorStoreIndex } from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const reader = new CSVReader(false);
    const docs = await reader.loadData("./data/movie_reviews.csv");

    const vectorStore = new MilvusVectorStore({ collection: collectionName });

    const ctx = await storageContextFromDefaults({ vectorStore });
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });
  } catch (e) {
    console.error(e);
  }
}

void main();
