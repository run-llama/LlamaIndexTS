import { CollectionReference } from "@google-cloud/firestore";
import "dotenv/config";

import { FirestoreVectorStore } from "@llamaindex/firestore";
import { OpenAIEmbedding, Settings } from "llamaindex";

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

    vectorStore.delete("movie_reviews.csv");
  } catch (e) {
    console.error(e);
  }
}

void main();
