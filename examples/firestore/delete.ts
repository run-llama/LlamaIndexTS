import "dotenv/config";

import { FirestoreVectorStore } from "llamaindex";

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
      customCollectionReference: (rootCollection) => {
        return rootCollection
          .doc("accountId-123")
          .collection("files")
          .doc("fileId-123")
          .collection("vectors");
      },
    });

    vectorStore.delete("movie_reviews.csv");
  } catch (e) {
    console.error(e);
  }
}

void main();