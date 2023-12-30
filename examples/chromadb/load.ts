import {VectorStoreQueryMode} from "../../packages/core/src/storage/vectorStore/types";
import { PapaCSVReader } from 'llamaindex';
import { ChromaVectorStore } from '../../packages/core/src/storage/vectorStore/ChromaVectorStore';

import {
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const chromaDB = new ChromaVectorStore();

    await chromaDB.create(collectionName);
    console.log("Created collection with name: ", collectionName)

    await chromaDB.connect(collectionName);
    console.log("Connected to collection with name: ", collectionName)

    const reader = new PapaCSVReader(false);
    const docs = await reader.loadData("../astradb/data/movie_reviews.csv")

    const ctx = await storageContextFromDefaults({ vectorStore: chromaDB });
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });

    const docIdToDelete = "5768bf05-f70e-4f6a-895d-a682ff9a99a9";

    await chromaDB.delete(docIdToDelete);

    console.log(`Document with ID ${docIdToDelete} deleted successfully.`);

    const queryResult = await chromaDB.query({
      queryEmbedding: Array.from({ length: 1536 }, () => Math.random()),
      similarityTopK: 10,
      mode: VectorStoreQueryMode.DEFAULT
    });

    console.log("Query Result:", queryResult);

  } catch (e) {
    console.error(e);
  }
}

main();