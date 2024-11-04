import { CosmosClient } from "@azure/cosmos";
import { Document } from "@llamaindex/core/schema";
import {
  SimpleCosmosDBReader,
  type SimpleCosmosDBReaderLoaderConfig,
} from "llamaindex";
import { describe, expect, it, vi } from "vitest";

const createMockClient = (mockData?: unknown[]) => {
  const client = {
    database: vi.fn().mockReturnValue({
      container: vi.fn().mockReturnValue({
        items: {
          query: vi.fn().mockReturnValue({
            fetchAll: vi.fn().mockResolvedValue({
              resources: mockData || [],
            }),
          }),
        },
      }),
    }),
  };
  return client;
};

describe("SimpleCosmosDBReader", () => {
  let reader: SimpleCosmosDBReader;
  it("should throw an error if databaseName is missing", async () => {
    const client = createMockClient() as unknown as CosmosClient;
    const reader = new SimpleCosmosDBReader(client);

    await expect(
      reader.loadData({ databaseName: "", containerName: "test" }),
    ).rejects.toThrow("databaseName and containerName are required");
  });

  it("should throw an error if containerName is missing", async () => {
    const client = createMockClient() as unknown as CosmosClient;
    const reader = new SimpleCosmosDBReader(client);

    await expect(
      reader.loadData({ databaseName: "test", containerName: "" }),
    ).rejects.toThrow("databaseName and containerName are required");
  });

  it("should load data from Cosmos DB container", async () => {
    const mockData = [
      {
        id: "1",
        text1: ["Sample text 1", "Sample text 2"],
        text2: "Sample text 3",
        metadataField1: "Metadata 1",
        metadaField2: { field3: 1, field4: 2 },
      },
      {
        id: "2",
        text1: "Sample text 4",
        text2: "Sample text 5",
        metadataField1: ["prop1", "prop2"],
        metadaField2: { field3: 3, field4: 4 },
      },
    ];

    const mockCosmosClient = createMockClient(
      mockData,
    ) as unknown as CosmosClient;
    reader = new SimpleCosmosDBReader(mockCosmosClient);

    const simpleCosmosReaderConfig: SimpleCosmosDBReaderLoaderConfig = {
      databaseName: "testDatabase",
      containerName: "testContainer",
      fields: ["text1", "text2"],
      fieldSeparator: "\n",
      query: "SELECT * FROM c",
      metadataFields: ["metadataField1", "metadaField2"],
    };

    const res = await reader.loadData(simpleCosmosReaderConfig);

    expect(res).toEqual([
      new Document({
        id_: "1",
        text: "Sample text 1\nSample text 2\nSample text 3",
        metadata: {
          metadataField1: "Metadata 1",
          metadaField2: { field3: 1, field4: 2 },
        },
      }),
      new Document({
        id_: "2",
        text: "Sample text 4\nSample text 5",
        metadata: {
          metadataField1: ["prop1", "prop2"],
          metadaField2: { field3: 3, field4: 4 },
        },
      }),
    ]);
  });

  it("undefined fields should be empty", async () => {
    const mockData = [
      {
        id: "1",
        text: ["Sample text 1", "Sample text 2"],
        metadataField1: "Metadata 1",
      },
    ];

    const mockCosmosClient = createMockClient(
      mockData,
    ) as unknown as CosmosClient;
    reader = new SimpleCosmosDBReader(mockCosmosClient);

    const simpleCosmosReaderConfig: SimpleCosmosDBReaderLoaderConfig = {
      databaseName: "testDatabase",
      containerName: "testContainer",
      fields: ["text", "text1"],
      fieldSeparator: "\n",
      query: "SELECT * FROM c",
      metadataFields: ["metadataField1", "metadaField2"],
    };

    const res = await reader.loadData(simpleCosmosReaderConfig);
    expect(res).toEqual([
      new Document({
        id_: "1",
        text: "Sample text 1\nSample text 2\n",
        metadata: { metadataField1: "Metadata 1", metadaField2: undefined },
      }),
    ]);
  });

  it("should handle errors when loading data from Cosmos DB", async () => {
    const client = createMockClient() as unknown as CosmosClient;
    const reader = new SimpleCosmosDBReader(client);

    vi.spyOn(
      client
        .database("testDB")
        .container("testContainer")
        .items.query("Select * from c"),
      "fetchAll",
    ).mockRejectedValue("Fetch error");

    const config: SimpleCosmosDBReaderLoaderConfig = {
      databaseName: "testDB",
      containerName: "testContainer",
    };

    await expect(reader.loadData(config)).rejects.toThrow(
      "Error loading data from Cosmos DB: Fetch error",
    );
  });
});
