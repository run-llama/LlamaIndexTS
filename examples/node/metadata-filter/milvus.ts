import { MilvusVectorStore, VectorStoreIndex } from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const milvus = new MilvusVectorStore({ collection: collectionName });
    const index = await VectorStoreIndex.fromVectorStore(milvus);
    const retriever = index.asRetriever({ similarityTopK: 20 });

    console.log("\n=====\nQuerying the index with filters");
    const queryEngineWithFilters = index.asQueryEngine({
      retriever,
      preFilters: {
        filters: [
          {
            key: "document_id",
            value: "./data/movie_reviews.csv_37",
            operator: "==",
          },
          {
            key: "document_id",
            value: "./data/movie_reviews.csv_37",
            operator: "!=",
          },
        ],
        condition: "or",
      },
    });
    const resultAfterFilter = await queryEngineWithFilters.query({
      query: "Get all movie titles.",
    });
    console.log(`Query from ${resultAfterFilter.sourceNodes?.length} nodes`);
    console.log(resultAfterFilter.response);
  } catch (e) {
    console.error(e);
  }
}

void main();
