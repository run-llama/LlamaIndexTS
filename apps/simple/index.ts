import { Document } from "@llamaindex/core/src/Document";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import essay from "./essay";

const document = new Document("doc1", essay);
const index = VectorStoreIndex.fromDocuments([document]);
const queryEngine = index.asQueryEngine();
const response = await queryEngine.aquery("foo");
console.log(response);
