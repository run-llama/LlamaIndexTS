import { VectorStoreIndex } from "../BaseIndex";
import paulGrahamEssay from "./__fixtures__/paulGrahamEssay";
import { Document } from "../Node";

describe("Response streaming", () => {
  test("initializes", async () => {
    const document = new Document({ text: paulGrahamEssay });
    const index = await VectorStoreIndex.fromDocuments([document]);
    expect(true).toBe(true);
    const queryEngine = index.asQueryEngine();

    // // 1. an index can be a retriever or a query engine
    // // asQueryEngine
    // // asRetriever

    // // ... basically every time we call an we need optionally pass in the callBack

    // const response = await queryEngine.aquery(
    //   "What did the author do growing up?"
    // );
    // // BaseQueryEngine aquery
    // //

    // // LLMPredictor should basically take an optional streaming callback
    // // are guaranteed to recieve data from openAI in the correct order
    // // we are not guaranteed that this data will be in the correct order
    // // when it's sent down to the client
    // // we should add an ID on the streamed token such that we always maintain the correct order
    // console.log(response.toString());
  });
});
