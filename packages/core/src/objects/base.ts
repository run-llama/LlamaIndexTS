import { BaseNode, TextNode } from "../Node";
import { BaseRetriever } from "../Retriever";

// Assuming that necessary interfaces and classes (like OT, TextNode, BaseNode, etc.) are defined elsewhere
// Import statements (e.g., for TextNode, BaseNode) should be added based on your project's structure

export abstract class BaseObjectNodeMapping<OT> {
  // TypeScript doesn't support Python's classmethod directly, but we can use static methods as an alternative
  abstract fromObjects<OT>(
    objs: OT[],
    ...args: any[]
  ): BaseObjectNodeMapping<OT>;

  // Abstract methods in TypeScript
  abstract objNodeMapping(): Record<any, any>;
  abstract toNode(obj: OT): TextNode;

  // Concrete methods can be defined as usual
  validateObject(obj: OT): void {}

  // Implementing the add object logic
  addObj(obj: OT): void {
    this.validateObject(obj);
    this._addObj(obj);
  }

  // Abstract method for internal add object logic
  protected abstract _addObj(obj: OT): void;

  // Implementing toNodes method
  toNodes(objs: OT[]): TextNode[] {
    return objs.map((obj) => this.toNode(obj));
  }

  // Abstract method for internal from node logic
  protected abstract _fromNode(node: BaseNode): OT;

  // Implementing fromNode method
  fromNode(node: BaseNode): OT {
    const obj = this._fromNode(node);
    this.validateObject(obj);
    return obj;
  }

  // Abstract methods for persistence
  abstract persist(persistDir: string, objNodeMappingFilename: string): void;
}

// You will need to implement specific subclasses of BaseObjectNodeMapping as per your project requirements.

type QueryType = string;

export class ObjectRetriever<OT> {
  private _retriever: BaseRetriever;
  private _objectNodeMapping: BaseObjectNodeMapping<OT>;

  constructor(
    retriever: BaseRetriever,
    objectNodeMapping: BaseObjectNodeMapping<OT>,
  ) {
    this._retriever = retriever;
    this._objectNodeMapping = objectNodeMapping;
  }

  // In TypeScript, getters are defined like this.
  get retriever(): BaseRetriever {
    return this._retriever;
  }

  // Translating the retrieve method
  async retrieve(strOrQueryBundle: QueryType): Promise<OT[]> {
    const nodes = await this._retriever.retrieve(strOrQueryBundle);
    return nodes.map((node) => this._objectNodeMapping.fromNode(node.node));
  }

  // // Translating the _asQueryComponent method
  // public asQueryComponent(kwargs: any): any {
  //     return new ObjectRetrieverComponent(this);
  // }
}
