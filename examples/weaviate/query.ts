import { VectorStoreIndex, WeaviateVectorStore } from "llamaindex";

const indexName = "MovieReviews";

async function main() {
  try {
    const query = "Top 3 best reviewed movies and reviews";
    const vectorStore = new WeaviateVectorStore({ indexName });
    const index = await VectorStoreIndex.fromVectorStore(vectorStore);
    const retriever = index.asRetriever({ similarityTopK: 5 });
    const queryEngine = index.asQueryEngine({ retriever });
    const results = await queryEngine.query({ query });
    console.log(results.response);
  } catch (e) {
    console.error(e);
  }
}

void main();
