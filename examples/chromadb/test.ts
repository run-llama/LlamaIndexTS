import {
  ChromaVectorStore,
  PapaCSVReader,
  storageContextFromDefaults,
  VectorStoreIndex
} from "llamaindex"

async function main() {
  try {
    console.log("Loading data from astradb/data/movie_reviews.csv")
    const reader = new PapaCSVReader(false, ", ", "\n", {
      header: true
    });
    const docs = await reader.loadData("../astradb/data/movie_reviews.csv");

    console.log("Creating ChromaDB vector store")
    const collectionName = "movie_reviews";
    const chromaVS = new ChromaVectorStore({ collectionName });
    const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });
    console.log("Embedding documents and adding to index")
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });

    console.log("Querying index")
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query("Tell me about Godfrey Cheshire's rating of La Sapienza.");
    console.log(response.toString());
  } catch (e) {
    console.error(e);
  }
}

main();