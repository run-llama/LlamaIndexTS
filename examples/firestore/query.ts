import "dotenv/config";

import { FirestoreVectorStore, VectorStoreIndex } from "llamaindex";

const indexName = "MovieReviews";

async function main() {
  try {
    const vectorStore = new FirestoreVectorStore({
      clientOptions: {
        credentials: JSON.parse(process.env.GCP_CREDENTIALS!),
        projectId: process.env.GCP_PROJECT_ID!,
        databaseId: process.env.FIRESTORE_DB!,
        ignoreUndefinedProperties: true,
      },
      collectionName: indexName,
    });
    const index = await VectorStoreIndex.fromVectorStore(vectorStore);
    const retriever = index.asRetriever({ similarityTopK: 20 });

    const queryEngine = index.asQueryEngine({ retriever });
    const query = "Get all movie titles.";
    const results = await queryEngine.query({ query });
    console.log(`Query from ${results.sourceNodes?.length} nodes`);
    console.log(results.response);

    console.log("\n=====\nQuerying the index with filters");
    const queryEngineWithFilters = index.asQueryEngine({
      retriever,
      preFilters: {
        filters: [
          {
            key: "document_id",
            value: "./data/movie_reviews.csv_2",
            operator: "==",
          },
        ],
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
