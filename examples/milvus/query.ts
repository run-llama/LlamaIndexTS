import {
  MilvusVectorStore,
  serviceContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const milvus = new MilvusVectorStore();
    await milvus.connect(collectionName);

    const ctx = serviceContextFromDefaults();
    const index = await VectorStoreIndex.fromVectorStore(milvus, ctx);

    const retriever = await index.asRetriever({ similarityTopK: 20 });

    const queryEngine = await index.asQueryEngine({ retriever });

    const results = await queryEngine.query("What is the best reviewed movie?");

    console.log(results.response);
  } catch (e) {
    console.error(e);
  }
}

main();
