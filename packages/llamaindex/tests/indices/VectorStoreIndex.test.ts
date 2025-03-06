import type { StorageContext } from "llamaindex";
import {
  Document,
  OpenAIEmbedding,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { DocStoreStrategy } from "llamaindex/ingestion/strategies/index";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

const testDir = await mkdtemp(join(tmpdir(), "test-"));

import { mockEmbeddingModel } from "../utility/mockOpenAI.js";
import { mockStorageContext } from "../utility/mockStorageContext.js";

describe("VectorStoreIndex", () => {
  let storageContext: StorageContext;
  let testStrategy: (
    strategy: DocStoreStrategy,
    runs?: number,
  ) => Promise<Array<number>>;

  beforeAll(async () => {
    const embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(embedModel);
    Settings.embedModel = embedModel;

    storageContext = await mockStorageContext(testDir);
    testStrategy = async (
      strategy: DocStoreStrategy,
      runs: number = 2,
    ): Promise<Array<number>> => {
      const documents = [new Document({ text: "lorem ipsem", id_: "1" })];
      const entries = [];
      for (let i = 0; i < runs; i++) {
        await VectorStoreIndex.fromDocuments(documents, {
          storageContext,
          docStoreStrategy: strategy,
        });
        const docs = await storageContext.docStore.docs();
        entries.push(Object.keys(docs).length);
      }
      return entries;
    };
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  test("fromDocuments stores duplicates without a doc store strategy", async () => {
    const entries = await testStrategy(DocStoreStrategy.NONE);
    expect(entries[0]! + 1).toBe(entries[1]);
  });

  test("fromDocuments ignores duplicates with upserts doc store strategy", async () => {
    const entries = await testStrategy(DocStoreStrategy.UPSERTS);
    expect(entries[0]).toBe(entries[1]);
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true });
  });
});
