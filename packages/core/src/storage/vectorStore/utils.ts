import type { BaseNode, Metadata } from "../../Node.js";
import { ObjectType, jsonToNode } from "../../Node.js";

const DEFAULT_TEXT_KEY = "text";

export function validateIsFlat(obj: { [key: string]: any }): void {
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      throw new Error(`Value for metadata ${key} must not be another object`);
    }
  }
}

export function nodeToMetadata(
  node: BaseNode,
  removeText: boolean = false,
  textField: string = DEFAULT_TEXT_KEY,
  flatMetadata: boolean = false,
): Metadata {
  const { metadata, embedding, ...rest } = node.toMutableJSON();

  if (flatMetadata) {
    validateIsFlat(metadata);
  }

  if (removeText) {
    rest[textField] = "";
  }

  metadata["_node_content"] = JSON.stringify(rest);
  metadata["_node_type"] = node.constructor.name.replace("_", ""); // remove leading underscore to be compatible with Python

  metadata["document_id"] = node.sourceNode?.nodeId || "None";
  metadata["doc_id"] = node.sourceNode?.nodeId || "None";
  metadata["ref_doc_id"] = node.sourceNode?.nodeId || "None";

  return metadata;
}

type MetadataDictToNodeOptions = {
  // If the metadata doesn't contain node content, use this object as a fallback, for usage see
  // AstraDBVectorStore.ts
  fallback: Record<string, any>;
};

export function metadataDictToNode(
  metadata: Metadata,
  options?: MetadataDictToNodeOptions,
): BaseNode {
  const {
    _node_content: nodeContent,
    _node_type: nodeType,
    document_id,
    doc_id,
    ref_doc_id,
    ...rest
  } = metadata;
  let nodeObj;
  if (!nodeContent) {
    if (options?.fallback) {
      nodeObj = options?.fallback;
    } else {
      throw new Error("Node content not found in metadata.");
    }
  } else {
    nodeObj = JSON.parse(nodeContent);
    nodeObj.metadata = rest;
  }

  // Note: we're using the name of the class stored in `_node_type`
  // and not the type attribute to reconstruct
  // the node. This way we're compatible with LlamaIndex Python
  switch (nodeType) {
    case "IndexNode":
      return jsonToNode(nodeObj, ObjectType.INDEX);
    default:
      return jsonToNode(nodeObj, ObjectType.TEXT);
  }
}
