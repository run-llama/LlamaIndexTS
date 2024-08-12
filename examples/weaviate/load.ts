import {
  PapaCSVReader,
  storageContextFromDefaults,
  VectorStoreIndex,
  WeaviateVectorStore,
} from "llamaindex";

const indexName = "MovieReviews";

async function main() {
  try {
    const reader = new PapaCSVReader(false);
    const docs = await reader.loadData("./data/movie_reviews.csv");
    const vectorStore = new WeaviateVectorStore({ indexName });
    const storageContext = await storageContextFromDefaults({ vectorStore });
    await VectorStoreIndex.fromDocuments(docs, { storageContext });
    console.log("Successfully loaded data into Weaviate");
  } catch (e) {
    console.error(e);
  }
}

void main();
