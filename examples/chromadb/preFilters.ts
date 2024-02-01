import {
  ChromaVectorStore,
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

const collectionName = "dog_colors";

async function main() {
  try {
    const docs = [
      new Document({
        text: "The dog is brown",
        metadata: {
          dogId: "1",
        },
      }),
      new Document({
        text: "The dog is red",
        metadata: {
          dogId: "2",
        },
      }),
    ];

    console.log("Creating ChromaDB vector store");
    const chromaVS = new ChromaVectorStore({ collectionName });
    const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });

    console.log("Embedding documents and adding to index");
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });

    console.log("Querying index");
    const queryEngine = index.asQueryEngine({
      preFilters: {
        filters: [
          {
            key: "dogId",
            value: "2",
            filterType: "ExactMatch",
          },
        ],
      },
    });
    const response = await queryEngine.query({
      query: "What is the color of the dog?",
    });
    console.log(response.toString());
  } catch (e) {
    console.error(e);
  }
}

main();
