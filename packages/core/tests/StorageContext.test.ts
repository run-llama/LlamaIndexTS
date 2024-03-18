import {
  storageContextFromDefaults,
  type StorageContext,
} from "llamaindex/storage/StorageContext";
import { existsSync, rmSync } from "node:fs";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  vi,
  vitest,
} from "vitest";

vitest.spyOn(console, "error");

describe("StorageContext", () => {
  let storageContext: StorageContext;

  beforeAll(async () => {
    storageContext = await storageContextFromDefaults({
      persistDir: "/tmp/test_dir",
    });
  });

  test("initializes", async () => {
    vi.mocked(console.error).mockImplementation(() => {}); // silence console.error

    expect(existsSync("/tmp/test_dir")).toBe(true);
    expect(storageContext).toBeDefined();
  });

  afterAll(() => {
    rmSync("/tmp/test_dir", { recursive: true });
  });
});
