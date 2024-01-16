import { Document, SimpleMongoReader, VectorStoreIndex } from "llamaindex";
import { MongoClient } from "mongodb";

import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

async function main() {
  //Dummy test code
  const filterQuery = {};
  const limit: number = Infinity;
  const uri: string = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
  const client: MongoClient = new MongoClient(uri);

  //Where the real code starts
  const MR = new SimpleMongoReader(client);
  const documents: Document[] = await MR.loadData(
    "db",
    "collection",
    ["text"],
    "",
    filterQuery,
    limit,
  );

  //
  //If you need to look at low-level details of
  // a queryEngine (for example, needing to check each individual node)
  //

  // Split text and create embeddings. Store them in a VectorStoreIndex
  // var storageContext = await storageContextFromDefaults({});
  // var serviceContext = serviceContextFromDefaults({});
  // const docStore = storageContext.docStore;

  // for (const doc of documents) {
  //   docStore.setDocumentHash(doc.id_, doc.hash);
  // }
  // const nodes = serviceContext.nodeParser.getNodesFromDocuments(documents);
  // console.log(nodes);

  //
  // Making Vector Store from documents
  //

  const index = await VectorStoreIndex.fromDocuments(documents);
  // Create query engine
  const queryEngine = index.asQueryEngine();

  const rl = readline.createInterface({ input, output });
  while (true) {
    const query = await rl.question("Query: ");

    if (!query) {
      break;
    }

    const response = await queryEngine.query({ query });

    // Output response
    console.log(response.toString());
  }
}

main();
