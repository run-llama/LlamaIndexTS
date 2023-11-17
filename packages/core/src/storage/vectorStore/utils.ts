import { BaseNode, Metadata, ObjectType, jsonToNode } from "../../Node";

const DEFAULT_TEXT_KEY = "text";

export function validateIsFlat(obj: { [key: string]: any }): void {
  for (let key in obj) {
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
  const nodeObj = node.toJSON();
  const metadata = node.metadata;

  if (flatMetadata) {
    validateIsFlat(node.metadata);
  }

  if (removeText) {
    nodeObj[textField] = "";
  }

  nodeObj["embedding"] = null;

  metadata["_node_content"] = JSON.stringify(nodeObj);
  metadata["_node_type"] = node.constructor.name.replace("_", ""); // remove leading underscore to be compatible with Python

  metadata["document_id"] = node.sourceNode?.nodeId || "None";
  metadata["doc_id"] = node.sourceNode?.nodeId || "None";
  metadata["ref_doc_id"] = node.sourceNode?.nodeId || "None";

  return metadata;
}

export function metadataDictToNode(metadata: Metadata): BaseNode {
  const nodeContent = metadata["_node_content"];
  if (!nodeContent) {
    throw new Error("Node content not found in metadata.");
  }
  const nodeObj = JSON.parse(nodeContent);

  // Note: we're using the name of the class stored in `_node_type`
  // and not the type attribute to reconstruct
  // the node. This way we're compatible with LlamaIndex Python
  const node_type = metadata["_node_type"];
  switch (node_type) {
    case "IndexNode":
      return jsonToNode(nodeObj, ObjectType.INDEX);
    default:
      return jsonToNode(nodeObj, ObjectType.TEXT);
  }
}
