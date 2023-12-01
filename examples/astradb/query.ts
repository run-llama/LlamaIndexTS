import { serviceContextFromDefaults } from "../../packages/core/src/ServiceContext";
import { VectorStoreIndex } from "../../packages/core/src/indices/vectorStore/VectorStoreIndex";
import { AstraDBVectorStore } from "../../packages/core/src/storage/vectorStore/AstraDBVectorStore";

const collectionName = "movie_reviews";

async function main() {
  try {
    const astraVS = new AstraDBVectorStore();
    await astraVS.connect(collectionName);

    const ctx = serviceContextFromDefaults();
    const index = await VectorStoreIndex.fromVectorStore(astraVS, ctx);

    const retriever = await index.asRetriever({ similarityTopK: 20 });

    const queryEngine = await index.asQueryEngine({ retriever });

    const results = await queryEngine.query("What is the best reviewed movie?");

    console.log(results.response);
  } catch (e) {
    console.error(e);
  }
}

main();
