import { OpenAIEmbedding } from "@llamaindex/openai";
import type { StorageContext } from "llamaindex";
import {
  DocStoreStrategy,
  Document,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, test, vi } from "vitest";

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

describe("[VectorStoreIndex] use embedding model", () => {
  it("should use embedding model passed in options instead of Settings", async () => {
    const documents = [new Document({ text: "This needs to be embedded" })];

    // Create mock embedding models
    const settingsEmbedModel = new OpenAIEmbedding();
    const customEmbedModel = new OpenAIEmbedding();

    // Mock the embedding models using the utility function
    mockEmbeddingModel(settingsEmbedModel);
    mockEmbeddingModel(customEmbedModel);

    // Add spies to track calls
    const settingsSpy = vi.spyOn(settingsEmbedModel, "getTextEmbeddings");
    const customSpy = vi.spyOn(customEmbedModel, "getTextEmbeddings");

    Settings.embedModel = settingsEmbedModel;

    const storageContext = await mockStorageContext(testDir, customEmbedModel); // setup custom embedding model
    await VectorStoreIndex.fromDocuments(documents, { storageContext });
    expect(customSpy).toHaveBeenCalled();
    expect(settingsSpy).not.toHaveBeenCalled();
  });
});
