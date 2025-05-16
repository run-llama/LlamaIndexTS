import { OpenAIEmbedding } from "@llamaindex/openai";
import {
  Document,
  Settings,
  SummaryIndex,
  VectorStoreIndex,
  storageContextFromDefaults,
  type StorageContext,
} from "llamaindex";
import { rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mockEmbeddingModel } from "../utility/mockOpenAI.js";

const testDir = await mkdtemp(join(tmpdir(), "test-"));

describe("SummaryIndex", () => {
  let storageContext: StorageContext;

  beforeAll(async () => {
    const embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(embedModel);
    Settings.embedModel = embedModel;

    storageContext = await storageContextFromDefaults({
      persistDir: testDir,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("SummaryIndex and VectorStoreIndex must be able to share the same storage context", async () => {
    const documents = [new Document({ text: "lorem ipsem", id_: "1" })];
    const vectorIndex = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    expect(vectorIndex).toBeDefined();
    const summaryIndex = await SummaryIndex.fromDocuments(documents, {
      storageContext,
    });
    expect(summaryIndex).toBeDefined();
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true });
  });
});
