import { CSVReader } from "@llamaindex/readers/csv";
import { WeaviateVectorStore } from "@llamaindex/weaviate";
import { storageContextFromDefaults, VectorStoreIndex } from "llamaindex";

const indexName = "MovieReviews";

async function main() {
  try {
    const reader = new CSVReader(false);
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
