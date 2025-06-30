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
import { existsSync, rmSync } from "node:fs";
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
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // storage context from individual stores
    const storageContext = await storageContextFromDefaults({
      docStore: await SimpleDocumentStore.fromPersistDir(testDir),
      vectorStore: await SimpleVectorStore.fromPersistDir(testDir),
      indexStore: await SimpleIndexStore.fromPersistDir(testDir),
    });

    const index = await VectorStoreIndex.fromDocuments([doc], {
      storageContext,
    });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("starting new store"),
    );
    expect(index).toBeDefined();

    const retriever = index.asRetriever();
    const result = await retriever.retrieve("test");
    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    // Check that the test data files exist
    await expectTestDataFilesExist(testDir);

    consoleErrorSpy.mockClear();

    // Now, load it again. Since data was persisted, we should not see the error.
    const newStorageContext = await storageContextFromDefaults({
      docStore: await SimpleDocumentStore.fromPersistDir(testDir),
      vectorStore: await SimpleVectorStore.fromPersistDir(testDir),
      indexStore: await SimpleIndexStore.fromPersistDir(testDir),
    });

    const loadedIndex = await VectorStoreIndex.init({
      storageContext: newStorageContext,
    });
    const loadedRetriever = loadedIndex.asRetriever();
    const loadedResult = await loadedRetriever.retrieve("test");
    expect(loadedResult).toBeDefined();
    expect(loadedResult.length).toBe(1);

    await expectTestDataFilesExist(testDir);

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
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
