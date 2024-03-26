import type { ServiceContext, StorageContext } from "llamaindex";
import {
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import { rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

const testDir = await mkdtemp(join(tmpdir(), "test-"));

vi.mock("llamaindex/llm/open_ai", () => {
  return {
    getOpenAISession: vi.fn().mockImplementation(() => null),
  };
});

import { mockServiceContext } from "../utility/mockServiceContext.js";

describe.sequential("VectorStoreIndex", () => {
  let serviceContext: ServiceContext;
  let storageContext: StorageContext;
  let testStrategy: (
    // strategy?: DocStoreStrategy,
    runs?: number,
  ) => Promise<Array<number>>;

  beforeAll(async () => {
    serviceContext = mockServiceContext();
    storageContext = await storageContextFromDefaults({
      persistDir: testDir,
    });
    testStrategy = async (
      // strategy?: DocStoreStrategy,
      runs: number = 2,
    ): Promise<Array<number>> => {
      const documents = [new Document({ text: "lorem ipsem", id_: "1" })];
      const entries = [];
      for (let i = 0; i < runs; i++) {
        await VectorStoreIndex.fromDocuments(documents, {
          serviceContext,
          storageContext,
          // docStoreStrategy: strategy,
        });
        const docs = await storageContext.docStore.docs();
        entries.push(Object.keys(docs).length);
      }
      return entries;
    };
  });

  test("fromDocuments does not stores duplicates per default", async () => {
    const entries = await testStrategy();
    expect(entries[0]).toBe(entries[1]);
  });

  // test("fromDocuments ignores duplicates in upserts", async () => {
  //   const entries = await testStrategy(DocStoreStrategy.DUPLICATES_ONLY);
  //   expect(entries[0]).toBe(entries[1]);
  // });

  afterAll(async () => {
    // TODO: VectorStoreIndex.fromDocuments running twice is causing a cleanup issue
    await new Promise((resolve) => setTimeout(resolve, 100));
    rmSync(testDir, { recursive: true });
  });
});
