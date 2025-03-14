import {
  Document,
  Settings,
  SimpleDocumentStore,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

Settings.callbackManager.on("retrieve-end", (event) => {
  const { nodes } = event.detail;
  console.log("Number of retrieved nodes:", nodes.length);
});

async function getDataSource() {
  const docs = [
    new Document({
      text: "The dog is brown",
      metadata: {
        dogId: "1",
        private: true,
      },
    }),
    new Document({
      text: "The dog is yellow",
      metadata: {
        dogId: "2",
        private: false,
      },
    }),
    new Document({
      text: "The dog is red",
      metadata: {
        dogId: "3",
        private: false,
      },
    }),
  ];
  const storageContext = await storageContextFromDefaults({
    persistDir: "./cache",
  });
  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    // Generate the data source if it's empty
    return await VectorStoreIndex.fromDocuments(docs, {
      storageContext,
    });
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}

async function main() {
  const index = await getDataSource();
  console.log(
    "=============\nQuerying index with no filters. The output should be any color.",
  );
  const queryEngineNoFilters = index.asQueryEngine({
    similarityTopK: 3,
  });
  const noFilterResponse = await queryEngineNoFilters.query({
    query: "What is the color of the dog?",
  });
  console.log("No filter response:", noFilterResponse.toString());

  console.log(
    "\n=============\nQuerying index with dogId 2 and private false. The output always should be red.",
  );
  const queryEngineEQ = index.asQueryEngine({
    preFilters: {
      filters: [
        {
          key: "private",
          value: "false",
          operator: "==",
        },
        {
          key: "dogId",
          value: "3",
          operator: "==",
        },
      ],
    },
    similarityTopK: 3,
  });
  const responseEQ = await queryEngineEQ.query({
    query: "What is the color of the dog?",
  });
  console.log("Filter with dogId 2 response:", responseEQ.toString());

  console.log(
    "\n=============\nQuerying index with dogId IN (1, 3). The output should be brown and red.",
  );
  const queryEngineIN = index.asQueryEngine({
    preFilters: {
      filters: [
        {
          key: "dogId",
          value: ["1", "3"],
          operator: "in",
        },
      ],
    },
    similarityTopK: 3,
  });
  const responseIN = await queryEngineIN.query({
    query: "What is the color of the dog?",
  });
  console.log("Filter with dogId IN (1, 3) response:", responseIN.toString());

  console.log(
    "\n=============\nQuerying index with dogId IN (1, 3). The output should be any.",
  );
  const queryEngineOR = index.asQueryEngine({
    preFilters: {
      filters: [
        {
          key: "private",
          value: "false",
          operator: "==",
        },
        {
          key: "dogId",
          value: ["1", "3"],
          operator: "in",
        },
      ],
      condition: "or",
    },
    similarityTopK: 3,
  });
  const responseOR = await queryEngineOR.query({
    query: "What is the color of the dog?",
  });
  console.log(
    "Filter with dogId with OR operator response:",
    responseOR.toString(),
  );
}

void main();
