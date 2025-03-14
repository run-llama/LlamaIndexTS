import { randomUUID } from "@llamaindex/env";
import type { UUID } from "../global";
import { BaseNode } from "../schema";
import { IndexStructType } from "./struct-type";

export abstract class IndexStruct {
  indexId: string;
  summary: string | undefined;

  constructor(
    indexId: UUID = randomUUID(),
    summary: string | undefined = undefined,
  ) {
    this.indexId = indexId;
    this.summary = summary;
  }

  toJson(): Record<string, unknown> {
    return {
      indexId: this.indexId,
      summary: this.summary,
    };
  }

  getSummary(): string {
    if (this.summary === undefined) {
      throw new Error("summary field of the index struct is not set");
    }
    return this.summary;
  }
}

// A table of keywords mapping keywords to text chunks.
export class KeywordTable extends IndexStruct {
  table: Map<string, Set<string>> = new Map();
  type: IndexStructType = IndexStructType.KEYWORD_TABLE;

  addNode(keywords: string[], nodeId: string): void {
    keywords.forEach((keyword) => {
      if (!this.table.has(keyword)) {
        this.table.set(keyword, new Set());
      }
      this.table.get(keyword)!.add(nodeId);
    });
  }

  deleteNode(keywords: string[], nodeId: string) {
    keywords.forEach((keyword) => {
      if (this.table.has(keyword)) {
        this.table.get(keyword)!.delete(nodeId);
      }
    });
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      table: Array.from(this.table.entries()).reduce(
        (acc, [keyword, nodeIds]) => {
          acc[keyword] = Array.from(nodeIds);
          return acc;
        },
        {} as Record<string, string[]>,
      ),
      type: this.type,
    };
  }
}

export class IndexDict extends IndexStruct {
  nodesDict: Record<string, BaseNode> = {};
  type: IndexStructType = IndexStructType.SIMPLE_DICT;

  addNode(node: BaseNode, textId?: string) {
    const vectorId = textId ?? node.id_;
    this.nodesDict[vectorId] = node;
  }

  toJson(): Record<string, unknown> {
    const nodesDict: Record<string, unknown> = {};

    for (const [key, node] of Object.entries(this.nodesDict)) {
      nodesDict[key] = node.toJSON();
    }

    return {
      ...super.toJson(),
      nodesDict,
      type: this.type,
    };
  }

  delete(nodeId: string) {
    delete this.nodesDict[nodeId];
  }
}

export class IndexList extends IndexStruct {
  nodes: string[] = [];
  type: IndexStructType = IndexStructType.LIST;

  addNode(node: BaseNode) {
    this.nodes.push(node.id_);
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      nodes: this.nodes,
      type: this.type,
    };
  }
}
