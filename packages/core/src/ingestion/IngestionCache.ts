import { createSHA256 } from "@llamaindex/env";
import { BaseNode, MetadataMode } from "../Node.js";
import { docToJson, jsonToDoc } from "../storage/docStore/utils.js";
import { SimpleKVStore } from "../storage/kvStore/SimpleKVStore.js";
import { BaseKVStore } from "../storage/kvStore/types.js";
import { TransformComponent } from "./types.js";

const transformToJSON = (obj: TransformComponent) => {
  const seen: any[] = [];

  const replacer = (key: string, value: any) => {
    if (value != null && typeof value == "object") {
      if (seen.indexOf(value) >= 0) {
        return;
      }
      seen.push(value);
    }
    return value;
  };

  // this is a custom replacer function that will allow us to handle circular references
  const jsonStr = JSON.stringify(obj, replacer);

  return jsonStr;
};

export function getTransformationHash(
  nodes: BaseNode[],
  transform: TransformComponent,
) {
  const nodesStr: string = nodes
    .map((node) => node.getContent(MetadataMode.ALL))
    .join("");

  const transformString: string = transformToJSON(transform);

  const hash = createSHA256();
  hash.update(nodesStr + transformString);
  return hash.digest();
}

export class IngestionCache {
  collection: string = "llama_cache";
  cache: BaseKVStore;
  nodesKey = "nodes";

  constructor(collection?: string) {
    if (collection) {
      this.collection = collection;
    }
    this.cache = new SimpleKVStore();
  }

  async put(hash: string, nodes: BaseNode[]) {
    const val = {
      [this.nodesKey]: nodes.map((node) => docToJson(node)),
    };
    await this.cache.put(hash, val, this.collection);
  }

  async get(hash: string): Promise<BaseNode[] | undefined> {
    const json = await this.cache.get(hash, this.collection);
    if (!json || !json[this.nodesKey] || !Array.isArray(json[this.nodesKey])) {
      return undefined;
    }
    return json[this.nodesKey].map((doc: any) => jsonToDoc(doc));
  }
}
