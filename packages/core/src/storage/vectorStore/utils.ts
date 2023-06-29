import {
  BaseNode
} from "../../Node"; 

export const DEFAULT_TEXT_KEY = "text";

function validateIsFlatDict(metadataDict: Record<string, any>): void {
  for (const [key, val] of Object.entries(metadataDict)) {
    if (typeof key !== "string") {
      throw new Error("Metadata key must be a string!");
    }
    if (
      typeof val !== "string" &&
      typeof val !== "number" &&
      typeof val !== "boolean" &&
      val !== null
    ) {
      throw new Error(
        `Value for metadata '${key}' must be one of (string, number, boolean, null)`
      );
    }
  }
}


export function nodeToMetadataDict(
  node: BaseNode,
  removeText: boolean = false,
  textField: string = DEFAULT_TEXT_KEY,
  flatMetadata: boolean = false,
): Record<string, any> {
  let metadata: Record<string, any> = node.metadata;

  if (flatMetadata) {
    validateIsFlatDict(metadata);
  }

  // Store entire node as a JSON string - some minor text duplication
  // TODO: figure out how to do this part
  let nodeDict = node.dict();
  if (removeText) {
    nodeDict[textField] = "";
  }

  // Remove embedding from nodeDict
  nodeDict["embedding"] = null;

  // Dump the remainder of nodeDict to a JSON string
  metadata["_nodeContent"] = JSON.stringify(nodeDict);

  // Store ref doc ID at the top level to allow metadata filtering
  // Kept for backwards compatibility, will consolidate in the future
  metadata["documentId"] = node.refDocId || "None"; // for Chroma
  metadata["docId"] = node.refDocId || "None"; // for Pinecone, Qdrant, Redis
  metadata["refDocId"] = node.refDocId || "None"; // for Weaviate

  return metadata;
}

export function metadataDictToNode(metadata: Record<string, any>): TextNode {
  const nodeJson = metadata["_node_content"];
  if (nodeJson === undefined) {
    throw new Error("Node content not found in metadata dict.");
  }

  return TextNode.parseRaw(nodeJson);
}
