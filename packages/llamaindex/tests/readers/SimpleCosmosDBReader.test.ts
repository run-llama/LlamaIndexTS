import { CosmosClient } from "@azure/cosmos";
import { Document } from "@llamaindex/core/schema";
import {
  SimpleCosmosDBReader,
  type SimpleCosmosReaderLoaderConfig,
} from "llamaindex";
import { describe, expect, it } from "vitest";
import { createMockClient } from "../utility/mockCosmosClient.js"; // Import the mock client

describe("SimpleCosmosDBReader", () => {
  let reader: SimpleCosmosDBReader;

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

    const simpleCosmosReaderConfig: SimpleCosmosReaderLoaderConfig = {
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

    const simpleCosmosReaderConfig: SimpleCosmosReaderLoaderConfig = {
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
});
