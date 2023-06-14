import { Document } from "../../packages/core/Document";
import { VectorStoreIndex } from "../../packages/core/Index";
import essay from "./essay";

const document = new Document("doc1", essay);
const index = VectorStoreIndex.fromDocuments([document]);
const queryEngine = index.asQueryEngine();
const response = queryEngine.query("foo");
console.log(response);
