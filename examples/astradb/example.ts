import {
  AstraDBVectorStore,
  Document,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

const collectionName = "test_collection";

async function main() {
  try {
    const docs = [
      new Document({
        text: "AstraDB is built on Apache Cassandra",
        metadata: {
          id: 123,
          foo: "bar",
        },
      }),
      new Document({
        text: "AstraDB is a NoSQL DB",
        metadata: {
          id: 456,
          foo: "baz",
        },
      }),
      new Document({
        text: "AstraDB supports vector search",
        metadata: {
          id: 789,
          foo: "qux",
        },
      }),
    ];

    const astraVS = new AstraDBVectorStore();
    await astraVS.create(collectionName, {
      vector: { dimension: 1536, metric: "cosine" },
    });
    await astraVS.connect(collectionName);

    const ctx = await storageContextFromDefaults({ vectorStore: astraVS });
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });

    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query({
      query: "Describe AstraDB.",
    });

    console.log(response.toString());
  } catch (e) {
    console.error(e);
  }
}

main();
