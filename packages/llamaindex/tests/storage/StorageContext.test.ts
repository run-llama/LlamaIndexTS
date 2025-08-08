import { OpenAIEmbedding } from "@llamaindex/openai";
import {
  Document,
  Settings,
  SimpleDocumentStore,
  SimpleIndexStore,
  SimpleVectorStore,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { access, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { mockEmbeddingModel } from "../utility/mockOpenAI.js";

describe("StorageContext", () => {
  let testDir: string;

  beforeAll(async () => {
    const embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(embedModel);
    Settings.embedModel = embedModel;
  });

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "test-"));
  });

  test("initializes", async () => {
    const storageContext = await storageContextFromDefaults({
      persistDir: testDir,
    });

    expect(existsSync(testDir)).toBe(true);
    expect(storageContext).toBeDefined();
  });

  test("persists and loads", async () => {
    const doc = new Document({ text: "test document" });
    // Create a Logger that spies on log (info) calls
    const spyLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    // storage context from individual stores
    const storageContext = await storageContextFromDefaults({
      docStore: await SimpleDocumentStore.fromPersistDir(testDir, undefined, {
        logger: spyLogger,
      }),
      vectorStore: await SimpleVectorStore.fromPersistDir(testDir, undefined, {
        logger: spyLogger,
      }),
      indexStore: await SimpleIndexStore.fromPersistDir(testDir, {
        logger: spyLogger,
      }),
    });

    const index = await VectorStoreIndex.fromDocuments([doc], {
      storageContext,
    });
    expect(spyLogger.log).toHaveBeenCalledTimes(3);
    expect(spyLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Starting new store"),
    );
    expect(index).toBeDefined();

    const retriever = index.asRetriever();
    const result = await retriever.retrieve("test");
    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    // Check that the test data files exist
    await expectTestDataFilesExist(testDir);

    spyLogger.log.mockClear();

    // Now, load it again. Since data was persisted, we should not see the error.
    const newStorageContext = await storageContextFromDefaults({
      docStore: await SimpleDocumentStore.fromPersistDir(testDir, undefined, {
        logger: spyLogger,
      }),
      vectorStore: await SimpleVectorStore.fromPersistDir(testDir, undefined, {
        logger: spyLogger,
      }),
      indexStore: await SimpleIndexStore.fromPersistDir(testDir, {
        logger: spyLogger,
      }),
    });

    const loadedIndex = await VectorStoreIndex.init({
      storageContext: newStorageContext,
    });
    const loadedRetriever = loadedIndex.asRetriever();
    const loadedResult = await loadedRetriever.retrieve("test");
    expect(loadedResult).toBeDefined();
    expect(loadedResult.length).toBe(1);

    await expectTestDataFilesExist(testDir);

    expect(spyLogger.log).not.toHaveBeenCalled();
  });

  test("throws error on corrupted data", async () => {
    // test SimpleKVStore
    const docStorePath = join(testDir, "doc_store.json");
    writeFileSync(docStorePath, "corrupted data");
    await expect(SimpleDocumentStore.fromPersistDir(testDir)).rejects.toThrow(
      /Failed to load data from path/,
    );
    // test SimpleVectorStore
    const vectorStorePath = join(testDir, "vector_store.json");
    writeFileSync(vectorStorePath, "corrupted data");
    await expect(SimpleVectorStore.fromPersistDir(testDir)).rejects.toThrow(
      /Failed to load data from path/,
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });
});

async function expectTestDataFilesExist(testDir: string) {
  const docStorePath = `${testDir}/doc_store.json`;
  const vectorStorePath = `${testDir}/vector_store.json`;
  const indexStorePath = `${testDir}/index_store.json`;

  expect(await access(docStorePath)).toBeUndefined();
  expect(await access(vectorStorePath)).toBeUndefined();
  expect(await access(indexStorePath)).toBeUndefined();
}
