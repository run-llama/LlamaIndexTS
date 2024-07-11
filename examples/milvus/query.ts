import { MilvusVectorStore, VectorStoreIndex } from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const milvus = new MilvusVectorStore({ collection: collectionName });
    const index = await VectorStoreIndex.fromVectorStore(milvus);
    const retriever = index.asRetriever({ similarityTopK: 20 });

    console.log("=====\nQuerying the index without any filters.");
    const queryEngineNoFilters = index.asQueryEngine({ retriever });
    const resultNoFilter = await queryEngineNoFilters.query({
      query: "Summary movie reviews",
    });
    console.log(`Query from ${resultNoFilter.sourceNodes?.length} nodes`);
    console.log(resultNoFilter.response);

    console.log("\n=====\nQuerying the index with filters");
    const queryEngineWithFilters = index.asQueryEngine({
      retriever,
      preFilters: {
        filters: [
          {
            key: "doc_id",
            value: [
              "./data/movie_reviews.csv_95",
              "./data/movie_reviews.csv_101",
            ],
            operator: "in",
          },
          {
            key: "document_id",
            value: "./data/movie_reviews.csv_37",
            operator: "==",
          },
        ],
        condition: "or",
      },
    });
    const resultAfterFilter = await queryEngineWithFilters.query({
      query: "Summary movie reviews",
    });
    console.log(`Query from ${resultAfterFilter.sourceNodes?.length} nodes`);
    console.log(resultAfterFilter.response);
  } catch (e) {
    console.error(e);
  }
}

void main();
