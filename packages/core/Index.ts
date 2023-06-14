import { Document } from "./Document";
import { Node } from "./Node";
import { BaseQueryEngine } from "./QueryEngine";

export class BaseIndex {
  constructor(nodes?: Node[]) {}

  asQueryEngine(): BaseQueryEngine {
    console.log("asQueryEngine");
    return new BaseQueryEngine();
  }
}

export class VectorStoreIndex extends BaseIndex {
  static fromDocuments(documents: Document[]): VectorStoreIndex {
    console.log("fromDocuments");
    return new VectorStoreIndex();
  }
}
