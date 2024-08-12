import type { BaseNode } from "@llamaindex/core/schema";
import { WeaviateVectorStore } from "llamaindex";
import { type Mocked } from "vitest";
import type { WeaviateClient } from "weaviate-client";

export class TestableWeaviateVectorStore extends WeaviateVectorStore {
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
      weaviateClient: {} as Mocked<WeaviateClient>,
    });
  }
}
