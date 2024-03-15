import {
  Document,
  SummaryIndex,
  VectorStoreIndex,
  storageContextFromDefaults,
  type ServiceContext,
  type StorageContext,
} from "llamaindex";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mockServiceContext } from "../utility/mockServiceContext.js";

describe("SummaryIndex", () => {
  let serviceContext: ServiceContext;
  let storageContext: StorageContext;

  beforeAll(async () => {
    serviceContext = mockServiceContext();
    storageContext = await storageContextFromDefaults({
      persistDir: "/tmp/test_dir",
    });
  });

  it("SummaryIndex and VectorStoreIndex must be able to share the same storage context", async () => {
    const documents = [new Document({ text: "lorem ipsem", id_: "1" })];
    const vectorIndex = await VectorStoreIndex.fromDocuments(documents, {
      serviceContext,
      storageContext,
    });
    expect(vectorIndex).toBeDefined();
    const summaryIndex = await SummaryIndex.fromDocuments(documents, {
      serviceContext,
      storageContext,
    });
    expect(summaryIndex).toBeDefined();
  });

  afterAll(() => {
    rmSync("/tmp/test_dir", { recursive: true });
  });
});
