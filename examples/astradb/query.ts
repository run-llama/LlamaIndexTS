import {
  AstraDBVectorStore,
  serviceContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const collectionName = "movie_reviews";

async function main() {
  try {
    const astraVS = new AstraDBVectorStore({ contentKey: "reviewtext" });
    await astraVS.connect(collectionName);

    const ctx = serviceContextFromDefaults();
    const index = await VectorStoreIndex.fromVectorStore(astraVS, ctx);

    const retriever = await index.asRetriever({ similarityTopK: 20 });

    const queryEngine = await index.asQueryEngine({ retriever });

    const results = await queryEngine.query({
      query: 'How was "La Sapienza" reviewed?',
    });

    console.log(results.response);
  } catch (e) {
    console.error(e);
  }
}

main();
