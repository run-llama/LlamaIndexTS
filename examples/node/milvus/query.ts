import { MilvusVectorStore, VectorStoreIndex } from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const milvus = new MilvusVectorStore({ collection: collectionName });

    const index = await VectorStoreIndex.fromVectorStore(milvus);

    const retriever = await index.asRetriever({ similarityTopK: 20 });

    const queryEngine = await index.asQueryEngine({ retriever });

    const results = await queryEngine.query({
      query: "What is the best reviewed movie?",
    });

    console.log(results.response);
  } catch (e) {
    console.error(e);
  }
}

void main();
