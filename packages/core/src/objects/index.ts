/**
 * @todo refactor this module, most of the part is broken
 *  reference
 *    - https://github.com/run-llama/LlamaIndexTS/pull/531
 *    - https://github.com/run-llama/LlamaIndexTS/pull/416
 */
import type { MessageContent } from "../llms";
import { BaseRetriever } from "../retriever";
import { BaseNode, TextNode } from "../schema";
import { extractText } from "../utils";

// Assuming that necessary interfaces and classes (like OT, TextNode, BaseNode, etc.) are defined elsewhere
// Import statements (e.g., for TextNode, BaseNode) should be added based on your project's structure
export abstract class BaseObjectNodeMapping {
  // TypeScript doesn't support Python's classmethod directly, but we can use static methods as an alternative
  abstract fromObjects<OT>(objs: OT[], ...args: any[]): BaseObjectNodeMapping;

  // Abstract methods in TypeScript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract objNodeMapping(): Record<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract toNode(obj: any): TextNode;

  // Concrete methods can be defined as usual
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateObject(obj: any): void {}

  // Implementing the add object logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addObj(obj: any): void {
    this.validateObject(obj);
    this._addObj(obj);
  }

  // Abstract method for internal add object logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract _addObj(obj: any): void;

  // Implementing toNodes method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toNodes(objs: any[]): TextNode[] {
    return objs.map((obj) => this.toNode(obj));
  }

  // Abstract method for internal from node logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract _fromNode(node: BaseNode): any;

  // Implementing fromNode method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromNode(node: BaseNode): any {
    const obj = this._fromNode(node);
    this.validateObject(obj);
    return obj;
  }

  // Abstract methods for persistence
  abstract persist(persistDir: string, objNodeMappingFilename: string): void;
}

export class ObjectRetriever<T = unknown> {
  _retriever: BaseRetriever;
  _objectNodeMapping: BaseObjectNodeMapping;

  constructor(
    retriever: BaseRetriever,
    objectNodeMapping: BaseObjectNodeMapping,
  ) {
    this._retriever = retriever;
    this._objectNodeMapping = objectNodeMapping;
  }

  // In TypeScript, getters are defined like this.
  get retriever(): BaseRetriever {
    return this._retriever;
  }

  // Translating the retrieve method
  async retrieve(strOrQueryBundle: MessageContent): Promise<T[]> {
    const nodes = await this.retriever.retrieve({
      query: extractText(strOrQueryBundle),
    });
    const objs = nodes.map((n) => this._objectNodeMapping.fromNode(n.node));
    return objs;
  }
}
