import "dotenv/config";

import { OpenAIEmbedding } from "@llamaindex/openai";
import { Settings, VectorStoreIndex } from "llamaindex";

import { CollectionReference } from "@google-cloud/firestore";
import { FirestoreVectorStore } from "@llamaindex/firestore";

const indexName = "MovieReviews";

Settings.embedModel = new OpenAIEmbedding();

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
      customCollectionReference: (rootCollection: CollectionReference) => {
        return rootCollection.doc("accountId-123").collection("vectors");
      },
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
            key: "file_name",
            value: "movie_reviews.csv",
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
