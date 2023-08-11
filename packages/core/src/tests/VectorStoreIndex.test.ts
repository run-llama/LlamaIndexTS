import { VectorStoreIndex } from "../indices/vectorStore/VectorStoreIndex";
import { Document } from "../Node";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";

describe("VectorStoreIndex", () => {
  let serviceContext: ServiceContext;
  let document: Document;

  beforeAll(async () => {
    document = new Document({ text: "Author: My name is Paul Graham" });
    serviceContext = serviceContextFromDefaults();
  });

  test("asQueryEngine", async () => {
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments(
      [document],
      { serviceContext }
    );
    const queryEngine = vectorStoreIndex.asQueryEngine();
    expect(queryEngine).toBeDefined();
  });

  test("asRetriever", async () => {
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments(
      [document],
      { serviceContext }
    );
    const retriever = vectorStoreIndex.asRetriever();
    expect(retriever).toBeDefined();
  });

  // Add more tests for other methods of VectorStoreIndex
});
