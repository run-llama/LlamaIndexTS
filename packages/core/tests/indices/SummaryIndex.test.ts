import {
  Document,
  SummaryIndex,
  VectorStoreIndex,
  storageContextFromDefaults,
  type ServiceContext,
  type StorageContext,
} from "llamaindex";
import { rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const testDir = await mkdtemp(join(tmpdir(), "test-"));

vi.mock("llamaindex/llm/open_ai", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    getOpenAISession: vi.fn().mockImplementation(() => null),
  };
});

import { mockServiceContext } from "../utility/mockServiceContext.js";

describe("SummaryIndex", () => {
  let serviceContext: ServiceContext;
  let storageContext: StorageContext;

  beforeAll(async () => {
    serviceContext = mockServiceContext();
    storageContext = await storageContextFromDefaults({
      persistDir: testDir,
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
    rmSync(testDir, { recursive: true });
  });
});
