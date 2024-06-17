import {
  storageContextFromDefaults,
  type StorageContext,
} from "llamaindex/storage/StorageContext";
import { existsSync, rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  vi,
  vitest,
} from "vitest";
const testDir = await mkdtemp(join(tmpdir(), "test-"));
vitest.spyOn(console, "error");

describe("StorageContext", () => {
  let storageContext: StorageContext;

  beforeAll(async () => {
    storageContext = await storageContextFromDefaults({
      persistDir: testDir,
    });
  });

  test("initializes", async () => {
    vi.mocked(console.error).mockImplementation(() => {}); // silence console.error

    expect(existsSync(testDir)).toBe(true);
    expect(storageContext).toBeDefined();
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true });
  });
});
