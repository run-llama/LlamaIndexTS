import {
  ChromaVectorStore,
  Document,
  MetadataFilters,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

const collectionName = "dogs_with_color";

async function main() {
  try {
    const chromaVS = new ChromaVectorStore({ collectionName });
    const index = await VectorStoreIndex.fromVectorStore(chromaVS);

    const queryFn = async (filters?: MetadataFilters) => {
      console.log("\nQuerying dogs by filters: ", JSON.stringify(filters));
      const query = "List all colors of dogs";
      const queryEngine = index.asQueryEngine({
        preFilters: filters,
        similarityTopK: 3,
      });
      const response = await queryEngine.query({ query });
      console.log(response.toString());
    };

    await queryFn(); // red, brown, yellow
    await queryFn({ filters: [{ key: "dogId", value: "1", operator: "==" }] }); // brown
    await queryFn({ filters: [{ key: "dogId", value: "1", operator: "!=" }] }); // red, yellow
    await queryFn({
      filters: [
        { key: "dogId", value: "1", operator: "==" },
        { key: "dogId", value: "3", operator: "==" },
      ],
      condition: "or",
    }); // brown, yellow
    await queryFn({
      filters: [{ key: "dogId", value: ["1", "2"], operator: "in" }],
    }); // red, brown
  } catch (e) {
    console.error(e);
  }
}

async function generate() {
  const docs = [
    new Document({
      id_: "doc1",
      text: "The dog is brown",
      metadata: {
        dogId: "1",
      },
    }),
    new Document({
      id_: "doc2",
      text: "The dog is red",
      metadata: {
        dogId: "2",
      },
    }),
    new Document({
      id_: "doc3",
      text: "The dog is yellow",
      metadata: {
        dogId: "3",
      },
    }),
  ];

  console.log("Creating ChromaDB vector store");
  const chromaVS = new ChromaVectorStore({ collectionName });
  const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });

  console.log("Embedding documents and adding to index");
  await VectorStoreIndex.fromDocuments(docs, {
    storageContext: ctx,
  });
}

(async () => {
  await generate();
  await main();
})();
