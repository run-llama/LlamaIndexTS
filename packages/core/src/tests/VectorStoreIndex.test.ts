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

  test("fromDocuments", async () => {
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments(
      [document],
      { serviceContext }
    );
    expect(vectorStoreIndex).toBeDefined();
  });
  
  test("init", async () => {
    const vectorStoreIndex = await VectorStoreIndex.init({
      serviceContext,
      vectorStore: {},
      docStore: {},
      indexStore: {},
      indexStruct: {},
    });
    expect(vectorStoreIndex).toBeDefined();
  });
  
  test("getNodeEmbeddingResults", async () => {
    const nodeEmbeddingResults = await VectorStoreIndex.getNodeEmbeddingResults(
      [document],
      serviceContext
    );
    expect(nodeEmbeddingResults).toBeDefined();
  });
  
  test("buildIndexFromNodes", async () => {
    const indexDict = await VectorStoreIndex.buildIndexFromNodes(
      [document],
      serviceContext,
      {},
      {}
    );
    expect(indexDict).toBeDefined();
  });
  
  test("asQueryEngine", async () => {
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments(
      [document],
      { serviceContext }
    );
    const queryEngine = vectorStoreIndex.asQueryEngine();
    expect(queryEngine).toBeDefined();
  });
});