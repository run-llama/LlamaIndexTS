import { BaseNode, Metadata, TextNode } from "../Node";
import { BaseRetriever } from "../Retriever";
import { randomUUID } from "../env";
import { BaseTool } from "../types";

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
  protected abstract _addObj(obj: any): void;

  // Implementing toNodes method
  toNodes(objs: any[]): TextNode[] {
    return objs.map((obj) => this.toNode(obj));
  }

  // Abstract method for internal from node logic
  protected abstract _fromNode(node: BaseNode): any;

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
  private _retriever: BaseRetriever;
  private _objectNodeMapping: BaseObjectNodeMapping;

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
    const nodes = await this._retriever.retrieve(strOrQueryBundle);
    console.log({ topNodes: nodes });
    // @ts-ignore
    const objs = nodes.map((node) => this._objectNodeMapping.fromNode(node));

    console.log({ objs });
    return objs;
  }
}

// def convert_tool_to_node(tool: BaseTool) -> TextNode:
//     """Function convert Tool to node."""
//     node_text = (
//         f"Tool name: {tool.metadata.name}\n"
//         f"Tool description: {tool.metadata.description}\n"
//     )
//     if tool.metadata.fn_schema is not None:
//         node_text += f"Tool schema: {tool.metadata.fn_schema.schema()}\n"
//     return TextNode(
//         text=node_text,
//         metadata={"name": tool.metadata.name},
//         excluded_embed_metadata_keys=["name"],
//         excluded_llm_metadata_keys=["name"],
//     )

const convertToolToNode = (tool: BaseTool): TextNode => {
  const nodeText = `Tool name: ${tool.metadata.name}\nTool description: ${tool.metadata.description}\n`;
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
    if (node.metadata === null) {
      throw new Error("Metadata must be set");
    }
    console.log({ ux: node.metadata });
    return this._tools[randomUUID()];
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
  private _index: any;
  private _objectNodeMapping: BaseObjectNodeMapping;

  constructor(index: any, objectNodeMapping: BaseObjectNodeMapping) {
    this._index = index;
    this._objectNodeMapping = objectNodeMapping;
  }

  async fromObjects(
    objects: any,
    objectMapping: BaseObjectNodeMapping,
    indexCls: any,
    indexKwargs?: any,
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
