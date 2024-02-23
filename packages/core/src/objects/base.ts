import { BaseNode, Metadata, TextNode } from "../Node.js";
import { BaseRetriever } from "../Retriever.js";
import { VectorStoreIndex } from "../indices/index.js";
import { BaseTool } from "../types.js";

// Assuming that necessary interfaces and classes (like OT, TextNode, BaseNode, etc.) are defined elsewhere
// Import statements (e.g., for TextNode, BaseNode) should be added based on your project's structure

export abstract class BaseObjectNodeMapping {
  // TypeScript doesn't support Python's classmethod directly, but we can use static methods as an alternative
  abstract fromObjects<OT>(objs: OT[], ...args: any[]): BaseObjectNodeMapping;

  // Abstract methods in TypeScript
  abstract objNodeMapping(): Record<any, any>;
  abstract toNode(obj: any): TextNode;

  // Concrete methods can be defined as usual
  validateObject(obj: any): void {}

  // Implementing the add object logic
  addObj(obj: any): void {
    this.validateObject(obj);
    this._addObj(obj);
  }

  // Abstract method for internal add object logic
  abstract _addObj(obj: any): void;

  // Implementing toNodes method
  toNodes(objs: any[]): TextNode[] {
    return objs.map((obj) => this.toNode(obj));
  }

  // Abstract method for internal from node logic
  abstract _fromNode(node: BaseNode): any;

  // Implementing fromNode method
  fromNode(node: BaseNode): any {
    const obj = this._fromNode(node);
    this.validateObject(obj);
    return obj;
  }

  // Abstract methods for persistence
  abstract persist(persistDir: string, objNodeMappingFilename: string): void;
}

// You will need to implement specific subclasses of BaseObjectNodeMapping as per your project requirements.

type QueryType = string;

export class ObjectRetriever {
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
  async retrieve(strOrQueryBundle: QueryType): Promise<any> {
    const nodes = await this.retriever.retrieve(strOrQueryBundle);
    const objs = nodes.map((n) => this._objectNodeMapping.fromNode(n.node));
    return objs;
  }
}

const convertToolToNode = (tool: BaseTool): TextNode => {
  const nodeText = `
    Tool name: ${tool.metadata.name}
    Tool description: ${tool.metadata.description}
  `;
  return new TextNode({
    text: nodeText,
    metadata: { name: tool.metadata.name },
    excludedEmbedMetadataKeys: ["name"],
    excludedLlmMetadataKeys: ["name"],
  });
};

export class SimpleToolNodeMapping extends BaseObjectNodeMapping {
  private _tools: Record<string, BaseTool>;

  private constructor(objs: BaseTool[] = []) {
    super();
    this._tools = {};
    for (const tool of objs) {
      this._tools[tool.metadata.name] = tool;
    }
  }

  objNodeMapping(): Record<any, any> {
    return this._tools;
  }

  toNode(tool: BaseTool): TextNode {
    return convertToolToNode(tool);
  }

  _addObj(tool: BaseTool): void {
    this._tools[tool.metadata.name] = tool;
  }

  _fromNode(node: BaseNode): BaseTool {
    if (!node.metadata) {
      throw new Error("Metadata must be set");
    }
    return this._tools[node.metadata.name];
  }

  persist(persistDir: string, objNodeMappingFilename: string): void {
    // Implement the persist method
  }

  toNodes(objs: BaseTool[]): TextNode<Metadata>[] {
    return objs.map((obj) => this.toNode(obj));
  }

  addObj(obj: BaseTool): void {
    this._addObj(obj);
  }

  fromNode(node: BaseNode): BaseTool {
    return this._fromNode(node);
  }

  static fromObjects(objs: any, ...args: any[]): BaseObjectNodeMapping {
    return new SimpleToolNodeMapping(objs);
  }

  fromObjects<OT>(objs: any, ...args: any[]): BaseObjectNodeMapping {
    return new SimpleToolNodeMapping(objs);
  }
}

export class ObjectIndex {
  private _index: VectorStoreIndex;
  private _objectNodeMapping: BaseObjectNodeMapping;

  private constructor(index: any, objectNodeMapping: BaseObjectNodeMapping) {
    this._index = index;
    this._objectNodeMapping = objectNodeMapping;
  }

  static async fromObjects(
    objects: any,
    objectMapping: BaseObjectNodeMapping,
    // TODO: fix any (bundling issue)
    indexCls: any,
    indexKwargs?: Record<string, any>,
  ): Promise<ObjectIndex> {
    if (objectMapping === null) {
      objectMapping = SimpleToolNodeMapping.fromObjects(objects, {});
    }

    const nodes = objectMapping.toNodes(objects);

    const index = await indexCls.init({ nodes, ...indexKwargs });

    return new ObjectIndex(index, objectMapping);
  }

  insertObject(obj: any): void {
    this._objectNodeMapping.addObj(obj);
    const node = this._objectNodeMapping.toNode(obj);
    this._index.insertNodes([node]);
  }

  get tools(): Record<string, BaseTool> {
    return this._objectNodeMapping.objNodeMapping();
  }

  async asRetriever(kwargs: any): Promise<ObjectRetriever> {
    return new ObjectRetriever(
      this._index.asRetriever(kwargs),
      this._objectNodeMapping,
    );
  }

  asNodeRetriever(kwargs: any): any {
    return this._index.asRetriever(kwargs);
  }
}
