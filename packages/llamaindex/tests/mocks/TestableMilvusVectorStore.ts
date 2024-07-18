import type { BaseNode } from "@llamaindex/core/schema";
import type { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { MilvusVectorStore } from "llamaindex";
import { type Mocked } from "vitest";

export class TestableMilvusVectorStore extends MilvusVectorStore {
  public nodes: BaseNode[] = [];

  private fakeTimeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  public async add(nodes: BaseNode[]): Promise<string[]> {
    this.nodes.push(...nodes);
    await this.fakeTimeout(100);
    return nodes.map((node) => node.id_);
  }

  constructor() {
    super({
      milvusClient: {} as Mocked<MilvusClient>,
    });
  }
}
