import type { BaseNode } from "@llamaindex/core/schema";
import type { Mocked } from "vitest";
import { AzureCosmosDBNoSqlVectorStore } from "../../src/vector-store.js";

export class TestableAzureCosmosDBNoSqlVectorStore extends AzureCosmosDBNoSqlVectorStore {
  public nodes: BaseNode[] = [];

  private fakeTimeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  public async add(nodes: BaseNode[]): Promise<string[]> {
    this.nodes.push(...nodes);
    await this.fakeTimeout(100);
    for (const node of nodes) {
      await this.client.databases.containers.items.create(node);
    }
    return nodes.map((node) => node.id_);
  }

  public async delete(nodeId: string): Promise<void> {
    await this.client.databases.containers.item(nodeId).delete();
  }

  constructor(config: {
    client: Mocked<any>;
    endpoint: string;
    idKey: string;
    textKey: string;
    metadataKey: string;
  }) {
    super(config);
    this.client.databases.createIfNotExists();
    this.client.databases.containers.createIfNotExists();
  }
}
