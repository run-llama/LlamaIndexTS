import { Document } from "@llamaindex/core/src/Document";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import essay from "./essay";

(async () => {
  const document = new Document(essay);
  const index = await VectorStoreIndex.fromDocuments([document]);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.aquery(
    "What did the author do growing up?"
  );
  console.log(response.toString());
})();
