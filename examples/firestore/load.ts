import "dotenv/config";

import {
  CSVReader,
  FirestoreVectorStore,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const indexName = "MovieReviews";

async function main() {
  try {
    const reader = new CSVReader(false);
    const docs = await reader.loadData("./data/movie_reviews.csv");

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

    const storageContext = await storageContextFromDefaults({ vectorStore });

    await VectorStoreIndex.fromDocuments(docs, { storageContext });
  } catch (e) {
    console.error(e);
  }
}

void main();
