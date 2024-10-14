/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseNode } from "@llamaindex/core/schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestableAzureCosmosDBNoSqlVectorStore } from "../mocks/TestableAzureCosmosDBNoSqlVectorStore.js";
import { createMockClient } from "../utility/mockCosmosClient.js"; // Import the mock client

const createNodes = (n: number) => {
  const nodes: BaseNode[] = [];
  for (let i = 0; i < n; i += 1) {
    nodes.push({
      id_: `node-${i}`,
      getEmbedding: () => [0.1, 0.2, 0.3, 0.4],
      getContent: () => `content ${i}`,
    } as unknown as BaseNode);
  }
  return nodes;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AzureCosmosDBNoSqlVectorStore Tests", () => {
  it("should initialize correctly", async () => {
    const client = createMockClient();
    const store = new TestableAzureCosmosDBNoSqlVectorStore({
      client: client as any,
      endpoint: "https://example.com",
      idKey: "id",
      textKey: "text",
      metadataKey: "metadata",
    });

    await store.add(createNodes(10));

    expect(store).toBeDefined();

    expect(client.databases.createIfNotExists).toHaveBeenCalledTimes(1);
    expect(client.databases.containers.createIfNotExists).toHaveBeenCalledTimes(
      1,
    );
  });

  it("should add nodes", async () => {
    const client = createMockClient();
    const store = new TestableAzureCosmosDBNoSqlVectorStore({
      client: client as any,
      endpoint: "https://example.com",
      idKey: "id",
      textKey: "text",
      metadataKey: "metadata",
    });

    expect(store).toBeDefined();

    const nodes = createNodes(1500);
    await store.add(nodes);

    expect(client.databases.containers.items.create).toHaveBeenCalledTimes(
      1500,
    );
  });

  it("should delete nodes", async () => {
    const client = createMockClient();
    const store = new TestableAzureCosmosDBNoSqlVectorStore({
      client: client as any,
      endpoint: "https://example.com",
      idKey: "id",
      textKey: "text",
      metadataKey: "metadata",
    });

    const nodes = createNodes(10);
    await store.add(nodes);

    await store.delete("node-0");

    expect(client.databases.containers.item().delete).toHaveBeenCalledTimes(1);
  });

  it("should use specified IDs", async () => {
    const client = createMockClient();
    const store = new TestableAzureCosmosDBNoSqlVectorStore({
      client: client as any,
      endpoint: "https://example.com",
      idKey: "id",
      textKey: "text",
      metadataKey: "metadata",
    });

    expect(store).toBeDefined();

    const result = await store.add(createNodes(2));
    expect(client.databases.containers.items.create).toHaveBeenCalledTimes(2);
    expect(result).toEqual(["node-0", "node-1"]);
  });
});
