import { Document } from "./Document";
import { Node } from "./Node";

export class BaseIndex {
  constructor(nodes?: Node[]) {}

  fromDocuments(documents: Document[]) {
    console.log("fromDocuments");
  }

  asQueryEngine() {
    console.log("asQueryEngine");
  }
}

export class VectorStoreIndex extends BaseIndex {}
