import {
  Document,
  MetadataFilters,
  Settings,
  SimpleDocumentStore,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

async function getDataSource() {
  const docs = [
    new Document({ text: "The dog is brown", metadata: { dogId: "1" } }),
    new Document({ text: "The dog is yellow", metadata: { dogId: "2" } }),
  ];
  const storageContext = await storageContextFromDefaults({
    persistDir: "./cache",
  });
  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    return await VectorStoreIndex.fromDocuments(docs, { storageContext });
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}

Settings.callbackManager.on("retrieve-end", (event) => {
  const { nodes, query } = event.detail;
  console.log(`${query.query} - Number of retrieved nodes:`, nodes.length);
});

async function main() {
  const index = await getDataSource();
  const filters: MetadataFilters = {
    filters: [{ key: "dogId", value: "2", operator: "==" }],
  };

  const retriever = index.asRetriever({ similarityTopK: 3, filters });
  const queryEngine = index.asQueryEngine({
    similarityTopK: 3,
    preFilters: filters,
  });

  console.log("Retriever and query engine should only retrieve 1 node:");
  await retriever.retrieve({ query: "Retriever: get dog" });
  await queryEngine.query({ query: "QueryEngine: get dog" });
}

void main();
